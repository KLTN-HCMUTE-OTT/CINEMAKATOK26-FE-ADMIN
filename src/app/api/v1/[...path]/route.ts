import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function buildUpstreamUrl(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const upstreamUrl = new URL(request.nextUrl.pathname.replace(/^\/api\/v1/, '/api/v1'), apiUrl)

  request.nextUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value)
  })

  return upstreamUrl.toString()
}

async function proxyRequest(request: NextRequest) {
  const upstreamUrl = buildUpstreamUrl(request)
  const headers = new Headers(request.headers)
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const csrfToken = request.cookies.get('csrf-token')?.value

  headers.delete('host')
  headers.delete('content-length')
  headers.delete('if-none-match')
  headers.delete('if-modified-since')
  headers.delete('cache-control')
  headers.delete('pragma')

  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  const cookieParts = []

  if (accessToken) {
    cookieParts.push(`accessToken=${encodeURIComponent(accessToken)}`)
  }

  if (refreshToken) {
    cookieParts.push(`refreshToken=${encodeURIComponent(refreshToken)}`)
  }

  if (csrfToken) {
    cookieParts.push(`csrf-token=${encodeURIComponent(csrfToken)}`)
  }

  if (cookieParts.length > 0) {
    headers.set('cookie', cookieParts.join('; '))
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
    redirect: 'manual' // Never follow backend redirects — they cause HTML to be proxied as 200
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer()
  }

  let response: Response

  try {
    response = await fetch(upstreamUrl, init)
  } catch (err) {
    // Upstream (Cloudflare tunnel / backend) unreachable — surface a clean JSON
    // 502 instead of throwing, which would become an opaque 500 HTML page.
    return NextResponse.json({ error: 'Bad Gateway', message: 'Upstream (tunnel) unreachable' }, { status: 502 })
  }

  // Backend returned a redirect (3xx) — treat as authentication failure so the
  // client's axios interceptor can trigger token refresh and retry.
  if (response.status >= 300 && response.status < 400) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Session expired' }, { status: 401 })
  }

  const responseBody = await response.arrayBuffer()
  const responseHeaders = new Headers(response.headers)

  // fetch() (undici) transparently decompresses the upstream body when we call
  // .arrayBuffer(), but the original content-encoding/length headers remain.
  // Forwarding them with the already-decoded body makes the browser try to
  // decompress plain bytes → net::ERR_CONTENT_DECODING_FAILED (axios "Network
  // Error"). Cloudflare adds br/gzip even when the local origin didn't, which is
  // why this only breaks through the tunnel. Strip the now-stale headers.
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')
  responseHeaders.delete('transfer-encoding')

  responseHeaders.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  responseHeaders.set('pragma', 'no-cache')
  responseHeaders.set('expires', '0')

  const proxiedResponse = new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  })

  return proxiedResponse
}

export async function GET(request: NextRequest) {
  return proxyRequest(request)
}

export async function POST(request: NextRequest) {
  return proxyRequest(request)
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request)
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request)
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request)
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request)
}
