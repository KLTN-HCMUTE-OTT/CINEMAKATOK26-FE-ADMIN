/**
 * Environment configuration and validation
 * Centralized environment variable management with type safety
 */

// Client-side environment variables (exposed to browser)
export const publicEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'OTT Admin Dashboard',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
  ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  ALLOWED_ORIGINS: (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
} as const

// Server-side environment variables (never exposed to browser)
export const privateEnv = {
  // Security
  CSRF_SECRET: process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-session-secret-change-in-production',

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),

  // Development
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === 'true'
} as const

// Environment validation
const requiredEnvVars = {
  development: [],
  staging: ['CSRF_SECRET', 'SESSION_SECRET'],
  production: ['CSRF_SECRET', 'SESSION_SECRET']
} as const

export function validateEnvironment() {
  const env = (process.env.NODE_ENV as keyof typeof requiredEnvVars) || 'development'
  const required = requiredEnvVars[env] || []

  const missing = required.filter(varName => {
    const value = process.env[varName]

    return !value || value.trim() === ''
  })

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${env}: ${missing.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    )
  }

  return true
}

// Environment-specific configuration
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'test', // TypeScript doesn't recognize 'staging'

  // Security settings based on environment
  security: {
    enableCSRF: process.env.NODE_ENV !== 'development',
    enableRateLimit: process.env.NODE_ENV !== 'development',
    enableSecurityHeaders: true,
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  },

  // Logging settings
  logging: {
    level: privateEnv.LOG_LEVEL,
    enableConsole: process.env.NODE_ENV === 'development',
    enableFile: process.env.NODE_ENV === 'production'
  }
} as const

// Validate environment on import (in server context)
if (typeof window === 'undefined') {
  try {
    // Only validate in non-build contexts
    // During build, pages are just being compiled, not executed
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

    if (!isBuildTime) {
      validateEnvironment()
    }
  } catch (error) {
    console.error('Environment validation failed:', error)

    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
