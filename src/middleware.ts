import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { SecurityUtils } from '@/utils/security'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/error', '/under-maintenance']

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/': { maxRequests: 50, windowMs: 60000 },
  '/api/auth/': { maxRequests: 5, windowMs: 60000 },
  '/api/upload': { maxRequests: 10, windowMs: 300000 }
} as const

const STATIC_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

const IS_DEV = process.env.NODE_ENV === 'development'
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function buildCsp(nonce: string): string {
  const scriptSrc = IS_DEV
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: https://res.cloudinary.com https:`,
    "media-src 'self' blob:",
    `connect-src 'self' ${API_URL} https://cinematok2-bucket.s3.ap-southeast-1.amazonaws.com https://d3tgqwmd4gomdl.cloudfront.net https://www.youtube-nocookie.com https://veezy.shop https://api.cloudinary.com wss: ws:`,
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const isAuthApiRoute = pathname.startsWith('/api/auth/')
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname === '/favicon.ico'

  // Authentication check for protected routes
  if (!isPublicRoute && !isStaticAsset && !isAuthApiRoute) {
    const hasAuthCookie = request.cookies.has('accessToken')

    if (!hasAuthCookie) {
      const url = request.nextUrl.clone()

      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)

      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (isPublicRoute && !pathname.startsWith('/error') && !isAuthApiRoute) {
    const hasAuthCookie = request.cookies.has('accessToken')

    if (hasAuthCookie) {
      const url = request.nextUrl.clone()

      url.pathname = '/'

      return NextResponse.redirect(url)
    }
  }

  // Generate per-request nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Apply static security headers
  Object.entries(STATIC_SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply nonce-based CSP
  response.headers.set('Content-Security-Policy', buildCsp(nonce))

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitConfig =
      Object.entries(RATE_LIMITS).find(([path]) => pathname.startsWith(path))?.[1] || RATE_LIMITS['/api/']

    const identifier = `${clientIP}:${pathname}`
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
            ...STATIC_SECURITY_HEADERS
          }
        }
      )
    }
  }

  // CSRF Protection for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

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
            ...STATIC_SECURITY_HEADERS
          }
        }
      )
    }

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
              ...STATIC_SECURITY_HEADERS
            }
          }
        )
      }
    }
  }

  if (IS_DEV) {
    console.log(`[Security] ${request.method} ${pathname} from ${clientIP}`)
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
