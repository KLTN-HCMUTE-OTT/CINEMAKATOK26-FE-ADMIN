/**
 * Authentication Context
 * Provides authentication state and methods throughout the admin app
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, type LoginResponse } from '@/libs/api/auth.api'
import { syncAuthCookies, clearAuthCookies } from '@/utils/auth-cookies'
import { startTokenRefreshMonitor, stopTokenRefreshMonitor, updateTokenTimestamp } from '@/libs/api/token-manager'

interface User {
  id: string
  name: string
  avatar: string | null
  isAdmin: boolean
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

// Local storage keys
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Start/stop token refresh monitor based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      startTokenRefreshMonitor()
    } else {
      stopTokenRefreshMonitor()
    }

    return () => {
      stopTokenRefreshMonitor()
    }
  }, [isAuthenticated])

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY)
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser)

          // Admin check - only allow admin users
          if (parsedUser.isAdmin) {
            setUser(parsedUser)
          } else {
            // Clear non-admin user data
            localStorage.removeItem(USER_KEY)
            localStorage.removeItem(ACCESS_TOKEN_KEY)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login method
  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await authApi.login({ email, password })

      // Check if user is admin
      if (!response.isAdmin) {
        throw new Error('You do not have admin privileges to access this area.')
      }

      const userData: User = {
        id: response.id,
        name: response.name,
        avatar: response.avatar,
        isAdmin: response.isAdmin
      }

      // Store tokens and user data
      localStorage.setItem(ACCESS_TOKEN_KEY, response.token.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.token.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))

      // Update token timestamp for refresh monitor
      updateTokenTimestamp()

      // Sync to cookies for middleware
      syncAuthCookies()

      setUser(userData)

      // Redirect to admin dashboard
      router.push('/')
    } catch (error: any) {
      console.error('Login error:', error)
      // Re-throw với message từ API hoặc generic message
      throw new Error(error.message || 'Login failed. Please try again.')
    }
  }

  // Logout method
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and cookies
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      clearAuthCookies()

      setUser(null)
      router.push('/login')
    }
  }

  // Refresh authentication
  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const tokens = await authApi.refreshToken(refreshToken)

      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)

      // Update token timestamp
      updateTokenTimestamp()

      // Sync to cookies
      syncAuthCookies()
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
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

// Helper function to get refresh token
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}
