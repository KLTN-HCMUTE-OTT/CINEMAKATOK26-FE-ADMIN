import { NextRequest, NextResponse } from 'next/server'

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
    cache: 'no-store'
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer()
  }

  const response = await fetch(upstreamUrl, init)
  const responseBody = await response.arrayBuffer()
  const responseHeaders = new Headers(response.headers)
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
