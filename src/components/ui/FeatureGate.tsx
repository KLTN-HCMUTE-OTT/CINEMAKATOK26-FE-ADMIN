'use client'

import type { ReactNode } from 'react'

import type { FeatureFlag } from '@/libs/features'
import { isFeatureEnabled } from '@/libs/features'

interface FeatureGateProps {
  flag: FeatureFlag
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  if (!isFeatureEnabled(flag)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
