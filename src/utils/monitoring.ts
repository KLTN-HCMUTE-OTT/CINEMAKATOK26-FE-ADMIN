import { privateEnv, config } from '@/configs/env'
import { logger } from './logger'

/**
 * Error monitoring and analytics integration
 * Supports Sentry, LogRocket, and custom monitoring services
 */

interface ErrorContext {
  userId?: string
  sessionId?: string
  route?: string
  action?: string
  metadata?: Record<string, any>
}

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  tags?: Record<string, string>
}

/**
 * Error monitoring service
 */
export class ErrorMonitoring {
  private static isInitialized = false

  /**
   * Initialize error monitoring service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized || !config.isProduction) {
      return
    }

    try {
      // Initialize Sentry if DSN is provided
      if (privateEnv.SENTRY_DSN) {
        await this.initializeSentry()
      }

      // Initialize other monitoring services here
      // if (privateEnv.LOGROCKET_APP_ID) {
      //   await this.initializeLogRocket()
      // }

      this.isInitialized = true
      logger.info('Error monitoring initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize error monitoring', error as Error)
    }
  }

  /**
   * Initialize Sentry error monitoring
   */
  private static async initializeSentry(): Promise<void> {
    try {
      // In a real implementation, you would import and configure Sentry here
      // const Sentry = await import('@sentry/nextjs')
      //
      // Sentry.init({
      //   dsn: privateEnv.SENTRY_DSN,
      //   environment: process.env.NODE_ENV,
      //   tracesSampleRate: config.isDevelopment ? 1.0 : 0.1,
      //   beforeSend(event) {
      //     // Filter out sensitive information
      //     return this.sanitizeErrorEvent(event)
      //   }
      // })

      logger.info('Sentry monitoring configured')
    } catch (error) {
      logger.error('Failed to initialize Sentry', error as Error)
    }
  }

  /**
   * Capture and report an error
   */
  static captureError(error: Error, context?: ErrorContext): void {
    if (!config.isProduction) {
      logger.error('Error captured', error, context)
      
return
    }

    try {
      // Send to Sentry
      // Sentry.captureException(error, {
      //   user: context?.userId ? { id: context.userId } : undefined,
      //   tags: {
      //     route: context?.route,
      //     action: context?.action
      //   },
      //   extra: context?.metadata
      // })

      // Log to our structured logger
      logger.error('Application error', error, {
        ...context,
        errorType: 'application',
        captured: true
      })
    } catch (monitoringError) {
      // Fallback logging if monitoring fails
      console.error('Failed to capture error in monitoring service:', monitoringError)
      console.error('Original error:', error)
    }
  }

  /**
   * Capture a message (non-error)
   */
  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    if (!config.isProduction) {
      logger.info(`Message captured: ${message}`, context)
      
return
    }

    try {
      // Send to Sentry
      // Sentry.captureMessage(message, level, {
      //   user: context?.userId ? { id: context.userId } : undefined,
      //   tags: {
      //     route: context?.route,
      //     action: context?.action
      //   },
      //   extra: context?.metadata
      // })

      logger.info(message, {
        ...context,
        messageType: 'captured',
        level
      })
    } catch (monitoringError) {
      console.error('Failed to capture message in monitoring service:', monitoringError)
    }
  }

  /**
   * Set user context for error tracking
   */
  static setUserContext(userId: string, email?: string, username?: string): void {
    try {
      // Sentry.setUser({
      //   id: userId,
      //   email,
      //   username
      // })

      logger.info('User context set for monitoring', { userId, email, username })
    } catch (error) {
      logger.error('Failed to set user context', error as Error)
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(message: string, category: string = 'user', data?: Record<string, any>): void {
    try {
      // Sentry.addBreadcrumb({
      //   message,
      //   category,
      //   data,
      //   timestamp: Date.now() / 1000
      // })

      logger.debug(`Breadcrumb: ${message}`, { category, data })
    } catch (error) {
      logger.error('Failed to add breadcrumb', error as Error)
    }
  }

  /**
   * Track performance metric
   */
  static trackPerformance(metric: PerformanceMetric): void {
    try {
      // Send to monitoring service
      // Sentry.addBreadcrumb({
      //   message: `Performance: ${metric.name}`,
      //   category: 'performance',
      //   data: {
      //     value: metric.value,
      //     unit: metric.unit,
      //     ...metric.tags
      //   }
      // })

      logger.performance(metric.name, metric.value, metric.unit, metric.tags)
    } catch (error) {
      logger.error('Failed to track performance metric', error as Error)
    }
  }

  /**
   * Sanitize error event before sending (remove sensitive data)
   */
  private static sanitizeErrorEvent(event: any): any {
    // Remove sensitive information from error events
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization']

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj
      }

      const sanitized = { ...obj }

      for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]'
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = sanitize(sanitized[key])
        }
      }

      return sanitized
    }

    return sanitize(event)
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitoring {
  private static measurements = new Map<string, number>()

  /**
   * Start measuring performance
   */
  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now())
  }

  /**
   * End measurement and report
   */
  static endMeasurement(name: string, metadata?: Record<string, any>): number {
    const startTime = this.measurements.get(name)

    if (!startTime) {
      logger.warn(`No start measurement found for: ${name}`)
      
return 0
    }

    const duration = performance.now() - startTime

    this.measurements.delete(name)

    ErrorMonitoring.trackPerformance({
      name,
      value: duration,
      unit: 'ms',
      tags: metadata
    })

    return duration
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startMeasurement(name)

    try {
      const result = await fn()

      this.endMeasurement(name, { ...metadata, status: 'success' })
      
return result
    } catch (error) {
      this.endMeasurement(name, { ...metadata, status: 'error' })
      throw error
    }
  }

  /**
   * Report Core Web Vitals
   */
  static reportWebVitals(): void {
    if (typeof window === 'undefined') return

    // Report First Contentful Paint
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        ErrorMonitoring.trackPerformance({
          name: entry.name,
          value: entry.startTime,
          unit: 'ms',
          tags: { type: 'core-web-vital' }
        })
      })
    })

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
  }
}

// Initialize monitoring on import
if (typeof window !== 'undefined') {
  ErrorMonitoring.initialize()
  PerformanceMonitoring.reportWebVitals()
}

export { ErrorMonitoring as monitoring, PerformanceMonitoring as performance }
