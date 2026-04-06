import DOMPurify from 'dompurify'
import validator from 'validator'

/**
 * Input sanitization utilities for XSS prevention
 */
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(content: string): string {
    if (typeof window === 'undefined') {
      // Server-side: basic cleanup
      return content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
    }

    // Client-side: use DOMPurify
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['class'],
      REMOVE_DATA_ATTRIBUTES: true,
      REMOVE_UNKNOWN_PROTOCOLS: true
    })
  }

  /**
   * Sanitize text input by removing dangerous characters
   */
  static sanitizeText(input: string): string {
    return validator.escape(input.trim())
  }

  /**
   * Validate and sanitize email input
   */
  static sanitizeEmail(email: string): string | null {
    const trimmed = email.trim().toLowerCase()

    
return validator.isEmail(trimmed) ? trimmed : null
  }

  /**
   * Sanitize URL input to prevent malicious redirects
   */
  static sanitizeUrl(url: string): string | null {
    const trimmed = url.trim()

    // Allow only HTTP/HTTPS URLs
    if (
      !validator.isURL(trimmed, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true,
        require_valid_protocol: true
      })
    ) {
      return null
    }

    return trimmed
  }

  /**
   * Validate file upload input
   */
  static validateFileUpload(
    file: File,
    options: {
      maxSize?: number // in bytes
      allowedTypes?: string[]
      allowedExtensions?: string[]
    } = {}
  ): { isValid: boolean; error?: string } {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = ['image/*', 'video/*', 'text/*'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.srt']
    } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${(maxSize / 1024 / 1024).toFixed(1)}MB`
      }
    }

    // Check file type
    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }

      
return file.type === type
    })

    if (!isTypeAllowed) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File extension ${fileExtension} is not allowed`
      }
    }

    return { isValid: true }
  }

  /**
   * Generate secure random string for CSRF tokens
   */
  static generateSecureToken(length: number = 32): string {
    if (typeof window === 'undefined') {
      // Server-side: use crypto
      const crypto = require('crypto')

      
return crypto.randomBytes(length).toString('hex')
    }

    // Client-side: use Web Crypto API
    const array = new Uint8Array(length)

    window.crypto.getRandomValues(array)
    
return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Rate limiting check (simple in-memory implementation)
   */
  private static requestCounts = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowStart = now - windowMs

    // Clean up old entries
    for (const [key, value] of this.requestCounts.entries()) {
      if (value.resetTime < now) {
        this.requestCounts.delete(key)
      }
    }

    const current = this.requestCounts.get(identifier)

    if (!current || current.resetTime < now) {
      // New window
      this.requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      
return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    current.count++
    
return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
}

/**
 * Hook for input sanitization in React components
 */
export const useSanitizedInput = () => {
  const sanitizeInput = (value: string, type: 'text' | 'html' | 'email' | 'url' = 'text') => {
    switch (type) {
      case 'html':
        return SecurityUtils.sanitizeHtml(value)
      case 'email':
        return SecurityUtils.sanitizeEmail(value) || ''
      case 'url':
        return SecurityUtils.sanitizeUrl(value) || ''
      case 'text':
      default:
        return SecurityUtils.sanitizeText(value)
    }
  }

  return { sanitizeInput }
}
