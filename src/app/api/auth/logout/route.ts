/**
 * BFF Auth Logout Route Handler
 * Clears httpOnly cookies and invalidates session on backend
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value

    // Notify backend to invalidate refresh token if needed
    if (accessToken) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      try {
        await fetch(`${apiUrl}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
          // Ignore errors from backend logout - we'll clear cookies anyway
        })
      } catch {
        // Ignore
      }
    }

    // Create response
    const res = NextResponse.json({ message: 'Logged out successfully' })

    // Clear httpOnly cookies (delete at all possible paths for safety)
    res.cookies.delete('accessToken')
    res.cookies.delete('refreshToken')
    res.cookies.delete({ name: 'refreshToken', path: '/api/auth/refresh' })
    res.cookies.delete('csrf-token')

    return res
  } catch (error) {
    console.error('Logout route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
