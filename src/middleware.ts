import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { SecurityUtils } from '@/utils/security'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/error', '/under-maintenance']

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/': { maxRequests: 50, windowMs: 60000 }, // 50 requests per minute for API
  '/api/auth/': { maxRequests: 5, windowMs: 60000 }, // 5 auth requests per minute
  '/api/upload': { maxRequests: 10, windowMs: 300000 } // 10 uploads per 5 minutes
} as const

// Security headers configuration
const SECURITY_HEADERS = {
  // CSRF Protection
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' blob:",
    "connect-src 'self' https://cinematok2-bucket.s3.ap-southeast-1.amazonaws.com  https://www.youtube-nocookie.com http://localhost:3000 http://localhost:3001 https://veezy.shop http://127.0.0.1:3000 http://127.0.0.1:3001 https://api.github.com https://api.cloudinary.com wss:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
} as const

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname === '/favicon.ico'

  // Authentication check for protected routes
  if (!isPublicRoute && !isStaticAsset) {
    // In Next.js middleware, we can't access localStorage directly
    // We need to check for authentication token in cookies or headers
    const hasAuthCookie = request.cookies.has('accessToken')

    if (!hasAuthCookie) {
      const url = request.nextUrl.clone()

      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)

      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (isPublicRoute && !pathname.startsWith('/error')) {
    const hasAuthCookie = request.cookies.has('accessToken')

    if (hasAuthCookie) {
      const url = request.nextUrl.clone()

      url.pathname = '/'

      return NextResponse.redirect(url)
    }
  }

  const response = NextResponse.next()
  const clientIP2 = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'

  // Apply security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitConfig =
      Object.entries(RATE_LIMITS).find(([path]) => pathname.startsWith(path))?.[1] || RATE_LIMITS['/api/']

    const identifier = `${clientIP2}:${pathname}`
    const rateLimit = SecurityUtils.checkRateLimit(identifier, rateLimitConfig.maxRequests, rateLimitConfig.windowMs)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())

    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            ...Object.fromEntries(Object.entries(SECURITY_HEADERS))
          }
        }
      )
    }
  }

  // CSRF Protection for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Check if origin matches host (basic CSRF protection)
    if (origin && host && !origin.endsWith(host)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: 'Invalid origin header'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(Object.entries(SECURITY_HEADERS))
          }
        }
      )
    }

    // For API routes, require CSRF token
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      const csrfToken = request.headers.get('X-CSRF-Token')
      const sessionCsrf = request.cookies.get('csrf-token')?.value

      if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'Invalid CSRF token'
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(Object.entries(SECURITY_HEADERS))
            }
          }
        )
      }
    }
  }

  // Log security events (in production, send to monitoring service)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Security] ${request.method} ${pathname} from ${clientIP2}`)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
}
