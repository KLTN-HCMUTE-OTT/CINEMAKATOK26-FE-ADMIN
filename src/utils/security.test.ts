import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecurityUtils } from './security'

describe('SecurityUtils', () => {
  describe('sanitizeText', () => {
    it('escapes HTML special characters', () => {
      const result = SecurityUtils.sanitizeText('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;')
    })

    it('trims whitespace', () => {
      const result = SecurityUtils.sanitizeText('  hello  ')
      expect(result).toBe('hello')
    })

    it('handles empty string', () => {
      expect(SecurityUtils.sanitizeText('')).toBe('')
    })

    it('escapes ampersands', () => {
      const result = SecurityUtils.sanitizeText('foo & bar')
      expect(result).toContain('&amp;')
    })

    it('escapes quotes', () => {
      const result = SecurityUtils.sanitizeText('say "hello"')
      expect(result).toContain('&quot;')
    })
  })

  describe('sanitizeEmail', () => {
    it('returns valid email lowercased and trimmed', () => {
      expect(SecurityUtils.sanitizeEmail('  Admin@Example.COM  ')).toBe('admin@example.com')
    })

    it('returns null for invalid email', () => {
      expect(SecurityUtils.sanitizeEmail('not-an-email')).toBeNull()
      expect(SecurityUtils.sanitizeEmail('')).toBeNull()
      expect(SecurityUtils.sanitizeEmail('missing@')).toBeNull()
    })

    it('accepts standard email formats', () => {
      expect(SecurityUtils.sanitizeEmail('user@domain.co')).toBe('user@domain.co')
      expect(SecurityUtils.sanitizeEmail('user.name+tag@domain.com')).toBe('user.name+tag@domain.com')
    })
  })

  describe('sanitizeUrl', () => {
    it('returns valid HTTPS URLs', () => {
      expect(SecurityUtils.sanitizeUrl('https://example.com/path')).toBe('https://example.com/path')
    })

    it('returns valid HTTP URLs', () => {
      expect(SecurityUtils.sanitizeUrl('http://example.com/api')).toBe('http://example.com/api')
    })

    it('returns null for javascript: protocol', () => {
      expect(SecurityUtils.sanitizeUrl('javascript:alert(1)')).toBeNull()
    })

    it('returns null for data: protocol', () => {
      expect(SecurityUtils.sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(SecurityUtils.sanitizeUrl('')).toBeNull()
    })

    it('returns null for non-url text', () => {
      expect(SecurityUtils.sanitizeUrl('not a url')).toBeNull()
    })

    it('trims whitespace', () => {
      expect(SecurityUtils.sanitizeUrl('  https://example.com  ')).toBe('https://example.com')
    })
  })

  describe('sanitizeHtml', () => {
    it('removes script tags', () => {
      const result = SecurityUtils.sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>Hello</p>')
    })

    it('allows whitelisted tags', () => {
      const result = SecurityUtils.sanitizeHtml('<b>bold</b> <em>italic</em> <p>paragraph</p>')
      expect(result).toContain('<b>bold</b>')
      expect(result).toContain('<em>italic</em>')
      expect(result).toContain('<p>paragraph</p>')
    })

    it('removes event handlers', () => {
      const result = SecurityUtils.sanitizeHtml('<p onclick="alert(1)">Click</p>')
      expect(result).not.toContain('onclick')
    })

    it('removes disallowed tags but keeps content', () => {
      const result = SecurityUtils.sanitizeHtml('<div>content</div>')
      expect(result).toContain('content')
      expect(result).not.toContain('<div>')
    })
  })

  describe('validateFileUpload', () => {
    function createMockFile(name: string, reportedSize: number, type: string): File {
      const file = new File(['x'], name, { type })
      Object.defineProperty(file, 'size', { value: reportedSize })
      return file
    }

    it('accepts valid image file', () => {
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg')
      const result = SecurityUtils.validateFileUpload(file)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('accepts valid video file', () => {
      const file = createMockFile('video.mp4', 5 * 1024 * 1024, 'video/mp4')
      const result = SecurityUtils.validateFileUpload(file)
      expect(result.isValid).toBe(true)
    })

    it('rejects file exceeding max size', () => {
      const file = createMockFile('big.mp4', 200 * 1024 * 1024, 'video/mp4')
      const result = SecurityUtils.validateFileUpload(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('exceeds limit')
    })

    it('rejects file with custom max size', () => {
      const file = createMockFile('img.jpg', 6 * 1024 * 1024, 'image/jpeg')
      const result = SecurityUtils.validateFileUpload(file, { maxSize: 5 * 1024 * 1024 })
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('exceeds limit')
    })

    it('rejects disallowed file type', () => {
      const file = createMockFile('malware.exe', 1024, 'application/x-msdownload')
      const result = SecurityUtils.validateFileUpload(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('rejects disallowed file extension', () => {
      const file = createMockFile('exploit.php', 1024, 'text/plain')
      const result = SecurityUtils.validateFileUpload(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('not allowed')
    })
  })

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Reset internal state between tests
      ;(SecurityUtils as any).requestCounts = new Map()
    })

    it('allows first request', () => {
      const result = SecurityUtils.checkRateLimit('test-user', 5)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('decrements remaining count', () => {
      SecurityUtils.checkRateLimit('user-1', 5)
      SecurityUtils.checkRateLimit('user-1', 5)
      const result = SecurityUtils.checkRateLimit('user-1', 5)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('blocks after max requests exceeded', () => {
      for (let i = 0; i < 3; i++) {
        SecurityUtils.checkRateLimit('limited-user', 3)
      }
      const result = SecurityUtils.checkRateLimit('limited-user', 3)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('tracks different identifiers independently', () => {
      for (let i = 0; i < 3; i++) {
        SecurityUtils.checkRateLimit('user-a', 3)
      }
      const result = SecurityUtils.checkRateLimit('user-b', 3)
      expect(result.allowed).toBe(true)
    })
  })

  describe('generateSecureToken', () => {
    it('generates a hex string of expected length', () => {
      const token = SecurityUtils.generateSecureToken(16)
      expect(token).toHaveLength(32) // 16 bytes = 32 hex chars
    })

    it('generates unique tokens', () => {
      const token1 = SecurityUtils.generateSecureToken()
      const token2 = SecurityUtils.generateSecureToken()
      expect(token1).not.toBe(token2)
    })

    it('uses default length of 32 bytes (64 hex chars)', () => {
      const token = SecurityUtils.generateSecureToken()
      expect(token).toHaveLength(64)
    })
  })
})
