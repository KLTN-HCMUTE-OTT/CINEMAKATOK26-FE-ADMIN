'use client'

import { useAuth } from '@/contexts/AuthContext'

export type AppRole = 'admin' | 'superadmin' | 'content_manager' | 'moderator'

/**
 * Maps the current user's attributes to role strings.
 * Extend this as the backend User type gains a `roles` array.
 */
function deriveRoles(user: { isAdmin: boolean } | null): AppRole[] {
  if (!user) return []

  const roles: AppRole[] = []

  if (user.isAdmin) {
    roles.push('admin')
  }

  return roles
}

export function useHasRole(requiredRoles: AppRole[]): boolean {
  const { user } = useAuth()
  const userRoles = deriveRoles(user)

  return requiredRoles.some(r => userRoles.includes(r))
}
