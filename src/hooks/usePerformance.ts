import React, { useEffect, useRef, useCallback } from 'react'

import { logger } from '@/utils/logger'

/**
 * Performance monitoring hooks for React components
 */

/**
 * Hook to measure component render performance
 */
export function useRenderPerformance(componentName: string, dependencies?: any[]) {
  const renderStartTime = useRef<number>()
  const renderCount = useRef(0)

  useEffect(() => {
    renderStartTime.current = performance.now()
    renderCount.current++
  })

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current

      // Track performance metric
      logger.performance(`${componentName}_render`, renderTime, 'ms', {
        component: componentName,
        renderCount: renderCount.current.toString()
      })

      // Log slow renders
      if (renderTime > 100) {
        logger.warn(`Slow render detected: ${componentName}`, {
          renderTime,
          renderCount: renderCount.current,
          dependencies: dependencies?.length || 0
        })
      }
    }
  })
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerformance() {
  const measure = useCallback(
    async <T>(operationName: string, operation: () => Promise<T>, metadata?: Record<string, any>): Promise<T> => {
      const startTime = performance.now()

      try {
        const result = await operation()
        const duration = performance.now() - startTime

        logger.performance(operationName, duration, 'ms', { ...metadata, status: 'success' })

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        logger.performance(operationName, duration, 'ms', { ...metadata, status: 'error' })

        throw error
      }
    },
    []
  )

  return { measure }
}

/**
 * Hook to track user interactions performance
 */
export function useInteractionPerformance() {
  const trackClick = useCallback((elementName: string, metadata?: Record<string, any>) => {
    logger.performance('user_interaction_click', performance.now(), 'timestamp', {
      element: elementName,
      type: 'click',
      ...metadata
    })
  }, [])

  const trackNavigation = useCallback((fromRoute: string, toRoute: string) => {
    logger.performance('user_navigation', performance.now(), 'timestamp', {
      from: fromRoute,
      to: toRoute,
      type: 'navigation'
    })
  }, [])

  return { trackClick, trackNavigation }
}

/**
 * Hook to monitor component lifecycle performance
 */
export function useLifecyclePerformance(componentName: string) {
  const mountTime = useRef<number>()
  const updateCount = useRef(0)

  useEffect(() => {
    // Component mounted
    mountTime.current = performance.now()

    logger.performance(`${componentName}_mount`, mountTime.current, 'timestamp', {
      component: componentName,
      lifecycle: 'mount'
    })

    return () => {
      // Component unmounted
      if (mountTime.current) {
        const lifetime = performance.now() - mountTime.current

        logger.performance(`${componentName}_unmount`, lifetime, 'ms', {
          component: componentName,
          lifecycle: 'unmount',
          updates: 'tracked'
        })
      }
    }
  }, [componentName])

  useEffect(() => {
    // Component updated
    updateCount.current++

    if (updateCount.current > 1) {
      // Skip initial mount
      logger.performance(`${componentName}_update`, performance.now(), 'timestamp', {
        component: componentName,
        lifecycle: 'update',
        updateNumber: updateCount.current.toString()
      })
    }
  })
}

/**
 * Hook to track API call performance
 */
export function useAPIPerformance() {
  const trackAPICall = useCallback(
    async <T>(endpoint: string, method: string, apiCall: () => Promise<T>): Promise<T> => {
      const startTime = performance.now()

      try {
        const result = await apiCall()
        const duration = performance.now() - startTime

        logger.performance('api_call_success', duration, 'ms', {
          endpoint,
          method,
          status: 'success'
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        logger.performance('api_call_error', duration, 'ms', {
          endpoint,
          method,
          status: 'error',
          error: error instanceof Error ? error.message : 'unknown'
        })

        throw error
      }
    },
    []
  )

  return { trackAPICall }
}

/**
 * Hook to monitor memory usage
 */
export function useMemoryMonitoring(componentName: string, intervalMs: number = 30000) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return
    }

    const monitorMemory = () => {
      const memory = (performance as any).memory

      logger.performance('memory_usage', memory.usedJSHeapSize, 'bytes', {
        component: componentName,
        totalHeapSize: memory.totalJSHeapSize.toString(),
        heapSizeLimit: memory.jsHeapSizeLimit.toString()
      })

      // Warn if memory usage is high
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

      if (usagePercentage > 80) {
        logger.warn(`High memory usage detected in ${componentName}`, {
          usagePercentage: Math.round(usagePercentage),
          usedMemory: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          totalMemory: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        })
      }
    }

    monitorMemory() // Initial measurement
    const interval = setInterval(monitorMemory, intervalMs)

    return () => clearInterval(interval)
  }, [componentName, intervalMs])
}

/**
 * Hook to track Core Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Measure Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]

      logger.performance('core_web_vital_lcp', lastEntry.startTime, 'ms', {
        vital: 'lcp',
        url: window.location.pathname
      })
    })

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Measure First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()

      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime

        logger.performance('core_web_vital_fid', fid, 'ms', {
          vital: 'fid',
          url: window.location.pathname
        })
      })
    })

    fidObserver.observe({ entryTypes: ['first-input'] })

    // Measure Cumulative Layout Shift (CLS)
    let clsValue = 0

    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()

      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value

          logger.performance('core_web_vital_cls', clsValue, 'score', {
            vital: 'cls',
            url: window.location.pathname
          })
        }
      })
    })

    clsObserver.observe({ entryTypes: ['layout-shift'] })

    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])
}

/**
 * Utility to create performance-aware components
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown'

    useRenderPerformance(name)
    useLifecyclePerformance(name)

    return React.createElement(Component, props)
  }

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`

  return WrappedComponent
}
