import { SecurityUtils } from './security'

/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 */
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32
  private static readonly COOKIE_NAME = 'csrf-token'
  private static readonly HEADER_NAME = 'X-CSRF-Token'

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    return SecurityUtils.generateSecureToken(this.TOKEN_LENGTH)
  }

  /**
   * Set CSRF token in cookie (server-side)
   */
  static setCookie(token: string): string {
    const secure = process.env.NODE_ENV === 'production'
    const sameSite = process.env.NODE_ENV === 'production' ? 'strict' : 'lax'

    return `${this.COOKIE_NAME}=${token}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=3600${secure ? '; Secure' : ''}`
  }

  /**
   * Verify CSRF token (server-side)
   */
  static verifyToken(headerToken: string | null, cookieToken: string | null): boolean {
    if (!headerToken || !cookieToken) {
      return false
    }

    return headerToken === cookieToken
  }

  /**
   * Client-side hook for CSRF protection
   */
  static useCSRFToken() {
    if (typeof window === 'undefined') {
      return { token: null, getHeaders: () => ({}) }
    }

    // Get token from cookie
    const getCookieValue = (name: string): string | null => {
      const cookies = document.cookie.split(';')

      for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=')

        if (key === name) {
          return decodeURIComponent(value)
        }
      }

      return null
    }

    const token = getCookieValue(this.COOKIE_NAME)

    const getHeaders = () => {
      if (!token) return {}

      return {
        [this.HEADER_NAME]: token
      }
    }

    return { token, getHeaders }
  }
}

/**
 * React hook for CSRF protection in components
 */
export const useCSRF = () => {
  return CSRFProtection.useCSRFToken()
}

/**
 * Fetch wrapper with automatic CSRF protection
 */
export const securityFetch = async (url: string, options: RequestInit = {}) => {
  const { getHeaders } = CSRFProtection.useCSRFToken()

  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getHeaders(),
      ...options.headers
    },
    credentials: 'same-origin' // Include cookies
  }

  return fetch(url, secureOptions)
}
