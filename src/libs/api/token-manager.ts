/**
 * Token Manager - Automatic Token Refresh System
 * Handles token refresh automatically and independently
 * Works globally without requiring changes to API services
 */

import axiosInstance from './axios-instance'

// Token configuration
const ACCESS_TOKEN_LIFETIME = 5 * 60 * 1000 // 5 minutes (backend setting)
const REFRESH_BEFORE_EXPIRY = 60 * 1000 // Refresh 1 minute before expiry (at 4 min mark)
const CHECK_INTERVAL = 30 * 1000 // Check every 30 seconds

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const TOKEN_TIMESTAMP_KEY = 'tokenTimestamp'

// State management
let isRefreshing = false
let refreshPromise: Promise<any> | null = null
let checkIntervalId: NodeJS.Timeout | null = null

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

/**
 * Call refresh token API directly using axios
 */
async function callRefreshAPI(refreshToken: string): Promise<TokenResponse> {
  const response = await axiosInstance.post('/auth/refresh', { refreshToken })
  return response.data.data // Backend returns { data: { accessToken, refreshToken } }
}

/**
 * Refresh token and update storage
 */
async function refreshToken(): Promise<void> {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing) {
    return refreshPromise!
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }

      const tokens = await callRefreshAPI(currentRefreshToken)

      // Update tokens in localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
      localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString())

      // Sync to cookies
      if (typeof document !== 'undefined') {
        document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=300; SameSite=Strict`
        document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Strict`
      }
    } catch (error) {
      // Clear tokens and redirect to login
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(TOKEN_TIMESTAMP_KEY)
      localStorage.removeItem('user')

      if (typeof document !== 'undefined') {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }

      throw error
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/**
 * Check token age and refresh if needed
 */
async function checkAndRefreshToken(): Promise<void> {
  const tokenTimestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY)
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

  if (!tokenTimestamp || !accessToken) {
    return // Not logged in
  }

  const tokenAge = Date.now() - parseInt(tokenTimestamp)
  const timeUntilExpiry = ACCESS_TOKEN_LIFETIME - tokenAge

  // If token will expire in less than 1 minute, refresh it proactively
  if (timeUntilExpiry < REFRESH_BEFORE_EXPIRY) {
    await refreshToken()
  }
}

/**
 * Start automatic token refresh background job
 */
export function startTokenRefreshMonitor(): void {
  if (typeof window === 'undefined') return

  // Clear existing interval if any
  if (checkIntervalId) {
    clearInterval(checkIntervalId)
  }

  // Initial check
  checkAndRefreshToken()

  // Check periodically
  checkIntervalId = setInterval(checkAndRefreshToken, CHECK_INTERVAL)
}

/**
 * Stop automatic token refresh
 */
export function stopTokenRefreshMonitor(): void {
  if (checkIntervalId) {
    clearInterval(checkIntervalId)
    checkIntervalId = null
  }
}

/**
 * Manual token refresh (can be called by API interceptor on 401)
 */
export async function manualRefreshToken(): Promise<void> {
  return refreshToken()
}

/**
 * Update token timestamp (call this after login)
 */
export function updateTokenTimestamp(): void {
  localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString())
}

/**
 * Get token age in milliseconds
 */
export function getTokenAge(): number {
  const tokenTimestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY)
  if (!tokenTimestamp) return Infinity
  return Date.now() - parseInt(tokenTimestamp)
}
