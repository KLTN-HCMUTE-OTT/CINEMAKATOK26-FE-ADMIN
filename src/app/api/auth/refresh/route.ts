/**
 * BFF Auth Refresh Token Route Handler
 * Refreshes expired access token using the refresh token stored in httpOnly cookie
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token available' }, { status: 401 })
    }

    // Call backend refresh endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      // If refresh fails, clear cookies
      const res = NextResponse.json(errorData || { error: 'Token refresh failed' }, { status: response.status })
      res.cookies.delete('accessToken')
      res.cookies.delete('refreshToken')
      return res
    }

    const data = await response.json()

    // Create response with success message
    const res = NextResponse.json({ message: 'Token refreshed' })

    // Update httpOnly cookies with new tokens
    res.cookies.set('accessToken', data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 15 // 15 minutes
    })

    // Optionally refresh the refresh token if backend provides a new one
    if (data.data.refreshToken) {
      res.cookies.set('refreshToken', data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    return res
  } catch (error) {
    console.error('Refresh route error:', error)
    const res = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    res.cookies.delete('accessToken')
    res.cookies.delete('refreshToken')
    return res
  }
}
