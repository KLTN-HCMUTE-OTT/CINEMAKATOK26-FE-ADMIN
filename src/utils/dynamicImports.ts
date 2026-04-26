import { createElement, type ComponentType } from 'react'

import dynamic from 'next/dynamic'
import { Skeleton } from '@mui/material'

/**
 * Enhanced dynamic import wrapper with loading states and error handling
 */
export function createDynamicComponent<P = {}>(
  importFunction: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loadingMessage?: string
    loadingHeight?: number
    ssr?: boolean
    retryable?: boolean
  } = {}
) {
  const { ssr = false, loadingHeight = 200 } = options

  return dynamic(importFunction, {
    loading: () => createElement(Skeleton, { variant: 'rectangular', height: loadingHeight, sx: { borderRadius: 1 } }),
    ssr
  })
}

/**
 * Pre-configured dynamic components for heavy features
 */

// Content management components
export const DynamicEpisodeModal = createDynamicComponent(() => import('@/components/organisms/EpisodeModal'), {
  loadingMessage: 'Loading episode editor...',
  ssr: false
})

export const DynamicSeasonModal = createDynamicComponent(() => import('@/components/organisms/SeasonModal'), {
  loadingMessage: 'Loading season editor...',
  ssr: false
})

export const DynamicVideoUploader = createDynamicComponent(() => import('@/components/shared/VideoUploader'), {
  loadingMessage: 'Loading uploader...',
  loadingHeight: 240,
  ssr: false
})

export const DynamicHLSVideoPlayer = createDynamicComponent(() => import('@/components/shared/HLSVideoPlayer'), {
  loadingMessage: 'Loading video player...',
  loadingHeight: 220,
  ssr: false
})

export const DynamicBlogEditor = createDynamicComponent(() => import('@/components/textEditor/TextEditor'), {
  loadingMessage: 'Loading editor...',
  loadingHeight: 360,
  ssr: false
})

export const DynamicApexChart = createDynamicComponent(() => import('@/libs/ApexCharts'), {
  loadingMessage: 'Loading chart...',
  loadingHeight: 220,
  ssr: false
})

// Analytics components
export const DynamicAnalyticsCharts = createDynamicComponent(() => import('@/app/(dashboard)/analytics/page'), {
  loadingMessage: 'Loading analytics dashboard...',
  ssr: false
})

// Subscription management
export const DynamicSubscriptionManagement = createDynamicComponent(
  () => import('@/components/organisms/SubscriptionPlansTable'),
  { loadingMessage: 'Loading subscription management...', ssr: true }
)

// Content preview (video player)
export const DynamicContentPreview = createDynamicComponent(() => import('@/components/content/ContentPreview'), {
  loadingMessage: 'Loading video player...',
  ssr: false
})

// Settings components
export const DynamicSettingsPanel = createDynamicComponent(() => import('@/components/organisms/GeneralSettings'), {
  loadingMessage: 'Loading settings...',
  ssr: true
})

// Marketing components
export const DynamicMarketingDashboard = createDynamicComponent(
  () => import('@/components/organisms/PromotionsTable'),
  { loadingMessage: 'Loading marketing tools...', ssr: true }
)

// System monitoring
export const DynamicSystemLogs = createDynamicComponent(() => import('@/components/organisms/SystemLogsTable'), {
  loadingMessage: 'Loading system logs...',
  ssr: true
})

export const DynamicSecurityLogs = createDynamicComponent(() => import('@/components/organisms/SecurityLogsTable'), {
  loadingMessage: 'Loading security logs...',
  ssr: true
})

/**
 * Lazy route components for code splitting by route
 */
export const LazyRoutes = {
  // Dashboard routes
  Analytics: createDynamicComponent(() => import('@/app/(dashboard)/analytics/page'), {
    loadingMessage: 'Loading analytics...',
    ssr: false
  }),

  LiveStreams: createDynamicComponent(() => import('@/app/(dashboard)/live-streams/page'), {
    loadingMessage: 'Loading live streams...',
    ssr: true
  }),

  Marketing: createDynamicComponent(() => import('@/app/(dashboard)/marketing/page'), {
    loadingMessage: 'Loading marketing...',
    ssr: true
  }),

  Moderation: createDynamicComponent(() => import('@/app/(dashboard)/moderation/page'), {
    loadingMessage: 'Loading moderation...',
    ssr: true
  }),

  Settings: createDynamicComponent(() => import('@/app/(dashboard)/settings/page'), {
    loadingMessage: 'Loading settings...',
    ssr: true
  }),

  SystemLogs: createDynamicComponent(() => import('@/app/(dashboard)/system/logs/page'), {
    loadingMessage: 'Loading system logs...',
    ssr: true
  })
}

/**
 * Preload utilities for performance optimization
 */
export const preloadComponent = {
  // Preload critical components on user interaction
  onUserIdle: (importFunctions: Array<() => Promise<any>>) => {
    if (typeof window === 'undefined') return

    const preload = () => {
      importFunctions.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.warn('Failed to preload component:', error)
        }
      })
    }

    // Preload after user is idle for 2 seconds
    let timeoutId: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(preload, 2000)
    }

    window.addEventListener('mousemove', resetTimeout)
    window.addEventListener('keydown', resetTimeout)

    // Initial timeout
    resetTimeout()

    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('mousemove', resetTimeout)
      window.removeEventListener('keydown', resetTimeout)
    }
  },

  // Preload on route hover
  onRouteHover: (importFunction: () => Promise<any>) => {
    if (typeof window === 'undefined') return () => {}

    let isPreloaded = false

    const preload = () => {
      if (!isPreloaded) {
        isPreloaded = true
        importFunction().catch(console.warn)
      }
    }

    return {
      onMouseEnter: preload,
      onFocus: preload
    }
  },

  // Preload critical routes on page load
  critical: () => {
    if (typeof window === 'undefined') return

    // Preload most visited routes
    const criticalImports = [
      () => import('@/app/(dashboard)/page'), // Dashboard
      () => import('@/app/(dashboard)/content/titles/page'), // Content
      () => import('@/app/(dashboard)/users/page') // Users
    ]

    // Preload after initial page load
    setTimeout(() => {
      criticalImports.forEach(fn => fn().catch(console.warn))
    }, 1000)
  }
}

// Auto-preload critical components
if (typeof window !== 'undefined') {
  preloadComponent.critical()
}
