/**
 * Auth utilities for cookie management
 * Syncs localStorage tokens with cookies for middleware authentication
 */

'use client'

// Sync tokens from localStorage to cookies
export function syncAuthCookies() {
  if (typeof window === 'undefined') return

  const accessToken = localStorage.getItem('accessToken')
  const refreshToken = localStorage.getItem('refreshToken')

  if (accessToken) {
    // Set cookie with httpOnly=false so we can read it in middleware
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`
  } else {
    // Clear cookie
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  if (refreshToken) {
    document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`
  } else {
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

// Clear auth cookies
export function clearAuthCookies() {
  if (typeof window === 'undefined') return

  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}
