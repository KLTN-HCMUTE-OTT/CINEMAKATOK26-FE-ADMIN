'use client'

import type { ReactNode } from 'react'

import type { AppRole } from '@/hooks/useHasRole'
import { useHasRole } from '@/hooks/useHasRole'

interface RoleGuardProps {
  roles: AppRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const hasRole = useHasRole(roles)

  if (!hasRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
