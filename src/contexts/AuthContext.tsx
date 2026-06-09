/**
 * Authentication Context
 * Provides authentication state and methods throughout the admin app
 */

'use client'

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  avatar: string | null
  isAdmin: boolean
  roles?: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Initialize auth state on mount
  // Check if user is already logged in (tokens in httpOnly cookies)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to verify auth by checking if we can access a protected endpoint
        // For now, we'll initialize as not logged in - the middleware will handle redirects
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login method - now calls BFF instead of backend directly
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include cookies
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        throw new Error(errorData.error || 'Login failed. Please try again.')
      }

      const data = await response.json()
      const userData: User = data.user

      // Check if user is admin
      if (!userData.isAdmin) {
        throw new Error('You do not have admin privileges to access this area.')
      }

      // Set user state - tokens are now in httpOnly cookies managed by the server
      setUser(userData)

      // Redirect to admin dashboard
      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed. Please try again.')
    }
  }

  // Logout method - now calls BFF to clear cookies
  const logout = async () => {
    try {
      // Call BFF logout endpoint to clear httpOnly cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state
      setUser(null)
      router.push('/login')
    }
  }

  // Refresh authentication - tokens are refreshed via interceptor
  const refreshAuth = async () => {
    try {
      // Call BFF refresh endpoint
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  
return context
}

// Helper function to get access token

// Helper function to get refresh token
// Note: Token management is now handled via httpOnly cookies
// These functions are kept for backward compatibility but return null
export function getAccessToken(): string | null {
  return null // httpOnly cookies are not accessible from JavaScript
}

export function getRefreshToken(): string | null {
  return null // httpOnly cookies are not accessible from JavaScript
}
