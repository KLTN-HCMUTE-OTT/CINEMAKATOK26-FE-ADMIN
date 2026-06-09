'use client'

import { useAuth } from '@/contexts/AuthContext'

export type AppRole = 'admin' | 'superadmin' | 'content_manager' | 'moderator'

const VALID_ROLES = new Set<string>(['admin', 'superadmin', 'content_manager', 'moderator'])

/**
 * Derives AppRole[] from the user object.
 * Prefers the `roles` array from the backend when available;
 * falls back to inferring from `isAdmin` for backward compatibility.
 */
function deriveRoles(user: { isAdmin: boolean; roles?: string[] } | null): AppRole[] {
  if (!user) return []

  if (user.roles?.length) {
    return user.roles.filter((r): r is AppRole => VALID_ROLES.has(r))
  }

  return user.isAdmin ? ['admin'] : []
}

export function useHasRole(requiredRoles: AppRole[]): boolean {
  const { user } = useAuth()
  const userRoles = deriveRoles(user)

  return requiredRoles.some(r => userRoles.includes(r))
}
