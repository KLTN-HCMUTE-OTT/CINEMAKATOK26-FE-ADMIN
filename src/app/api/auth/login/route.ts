/**
 * BFF Auth Login Route Handler
 * Backend-for-Frontend pattern for secure token management
 * Tokens are stored as httpOnly cookies instead of localStorage
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Call backend auth API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(errorData || { error: 'Authentication failed' }, { status: response.status })
    }

    const data = await response.json()

    // Check if user is admin
    if (!data.data?.isAdmin) {
      return NextResponse.json({ error: 'You do not have admin privileges to access this area.' }, { status: 403 })
    }

    // Create response with user data only (no tokens)
    const res = NextResponse.json({
      user: {
        id: data.data.id,
        name: data.data.name,
        avatar: data.data.avatar,
        isAdmin: data.data.isAdmin
      }
    })

    // Set httpOnly cookies for tokens
    // Access token: short-lived (15 minutes)
    res.cookies.set('accessToken', data.data.token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 15 // 15 minutes
    })

    // Refresh token: long-lived (7 days)
    res.cookies.set('refreshToken', data.data.token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    // CSRF token: readable by browser JS so it can be mirrored into the request header
    res.cookies.set('csrf-token', randomBytes(32).toString('hex'), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60
    })

    return res
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
