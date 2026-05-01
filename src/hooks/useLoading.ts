import { useCallback } from 'react'

import { useUIStore } from '@/store/ui.store'

export function useLoading(key: string) {
  const { startLoading, stopLoading, isLoading } = useUIStore()

  const loading = isLoading(key)

  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      startLoading(key)

      try {
        return await fn()
      } finally {
        stopLoading(key)
      }
    },
    [key, startLoading, stopLoading]
  )

  return { loading, startLoading: () => startLoading(key), stopLoading: () => stopLoading(key), withLoading }
}
