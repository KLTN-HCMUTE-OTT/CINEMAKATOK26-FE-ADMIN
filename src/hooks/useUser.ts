/**
 * useUser Hook
 * Convenient hook to access current user information
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'

export function useUser() {
  const { user, isAuthenticated, isLoading } = useAuth()

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.isAdmin ?? false
  }
}
