import { privateEnv } from '@/configs/env'

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  metadata?: Record<string, any>
  stack?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  ip?: string
  url?: string
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableFile: boolean
  enableRemote: boolean
  context?: string
}

/**
 * Production-grade structured logger
 */
export class Logger {
  private config: LoggerConfig
  private context: string

  constructor(context: string = 'App', config?: Partial<LoggerConfig>) {
    this.context = context
    this.config = {
      level: this.getLogLevel(privateEnv.LOG_LEVEL),
      enableConsole: config?.enableConsole ?? process.env.NODE_ENV === 'development',
      enableFile: config?.enableFile ?? process.env.NODE_ENV === 'production',
      enableRemote: config?.enableRemote ?? !!privateEnv.SENTRY_DSN,
      ...config
    }
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR
      case 'warn':
        return LogLevel.WARN
      case 'info':
        return LogLevel.INFO
      case 'debug':
        return LogLevel.DEBUG
      default:
        return LogLevel.INFO
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.config.level
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const contextInfo = this.context ? `[${this.context}]` : ''

    if (metadata && Object.keys(metadata).length > 0) {
      return `${timestamp} ${levelName} ${contextInfo} ${message} ${JSON.stringify(metadata)}`
    }

    return `${timestamp} ${levelName} ${contextInfo} ${message}`
  }

  private createLogEntry(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata
    }

    // Add context information if available
    if (typeof window !== 'undefined') {
      entry.userAgent = window.navigator.userAgent
      entry.url = window.location.href
    }

    return entry
  }

  private async writeToConsole(entry: LogEntry): Promise<void> {
    if (!this.config.enableConsole) return

    const formattedMessage = this.formatMessage(entry.level, entry.message, entry.metadata)

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.stack ? `\nStack: ${entry.stack}` : '')
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile || typeof window !== 'undefined') return

    // In a real implementation, you would write to a file or log aggregation service
    // For now, we'll use console as a placeholder
    console.log(JSON.stringify(entry))
  }

  private async writeToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote) return

    try {
      const Sentry = await import('@sentry/nextjs')

      if (entry.level === LogLevel.ERROR) {
        Sentry.captureException(entry.metadata?.stack ? new Error(entry.message) : entry.message, {
          extra: entry.metadata
        })
      } else if (entry.level === LogLevel.WARN) {
        Sentry.captureMessage(entry.message, { level: 'warning', extra: entry.metadata })
      }
    } catch (error) {
      console.error('Failed to send log to remote service:', error)
    }
  }

  private async log(level: LogLevel, message: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.shouldLog(level)) return

    const entry = this.createLogEntry(level, message, metadata)

    // Write to all enabled outputs
    await Promise.all([this.writeToConsole(entry), this.writeToFile(entry), this.writeToRemote(entry)])
  }

  /**
   * Log error messages
   */
  async error(message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    const errorMetadata = {
      ...metadata,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack
      })
    }

    await this.log(LogLevel.ERROR, message, errorMetadata)
  }

  /**
   * Log warning messages
   */
  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.WARN, message, metadata)
  }

  /**
   * Log info messages
   */
  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.INFO, message, metadata)
  }

  /**
   * Log debug messages
   */
  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.log(LogLevel.DEBUG, message, metadata)
  }

  /**
   * Log user actions for audit trail
   */
  async audit(action: string, userId: string, metadata?: Record<string, any>): Promise<void> {
    await this.info(`User action: ${action}`, {
      userId,
      action,
      ...metadata
    })
  }

  /**
   * Log performance metrics
   */
  async performance(metric: string, value: number, unit: string = 'ms', metadata?: Record<string, any>): Promise<void> {
    await this.info(`Performance metric: ${metric}`, {
      metric,
      value,
      unit,
      ...metadata
    })
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string, metadata?: Record<string, any>): Logger {
    const childLogger = new Logger(`${this.context}:${context}`, this.config)

    // Override log method to include parent metadata
    const originalLog = childLogger.log.bind(childLogger)

    childLogger.log = async (level: LogLevel, message: string, childMetadata?: Record<string, any>) => {
      const combinedMetadata = { ...metadata, ...childMetadata }

      return originalLog(level, message, combinedMetadata)
    }

    return childLogger
  }
}

// Global logger instances
export const logger = new Logger('Global')
export const securityLogger = new Logger('Security')
export const performanceLogger = new Logger('Performance')
export const auditLogger = new Logger('Audit')

// Convenience functions for quick logging
export const log = {
  error: (message: string, error?: Error, metadata?: Record<string, any>) => logger.error(message, error, metadata),
  warn: (message: string, metadata?: Record<string, any>) => logger.warn(message, metadata),
  info: (message: string, metadata?: Record<string, any>) => logger.info(message, metadata),
  debug: (message: string, metadata?: Record<string, any>) => logger.debug(message, metadata),
  audit: (action: string, userId: string, metadata?: Record<string, any>) =>
    auditLogger.audit(action, userId, metadata),
  security: (message: string, metadata?: Record<string, any>) => securityLogger.warn(message, metadata),
  performance: (metric: string, value: number, unit?: string, metadata?: Record<string, any>) =>
    performanceLogger.performance(metric, value, unit, metadata)
}

export default logger
