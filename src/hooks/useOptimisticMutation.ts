import { useCallback, useRef } from 'react'

import { toast } from 'sonner'
import { useSWRConfig } from 'swr'

import { useUIStore } from '@/store/ui.store'

interface OptimisticMutationOptions<TData, TPayload> {
  key: string | (string | Record<string, unknown>)[]
  mutationFn: (payload: TPayload) => Promise<unknown>
  optimisticUpdate: (currentData: TData, payload: TPayload) => TData
  successMessage?: string
  errorMessage?: string
  loadingKey?: string
}

export function useOptimisticMutation<TData, TPayload>(options: OptimisticMutationOptions<TData, TPayload>) {
  const { mutate } = useSWRConfig()
  const { startLoading, stopLoading } = useUIStore()
  const inflightRef = useRef(false)

  const execute = useCallback(
    async (payload: TPayload) => {
      if (inflightRef.current) return

      inflightRef.current = true
      const lk = options.loadingKey

      if (lk) startLoading(lk)

      mutate(
        options.key,
        (current: TData | undefined) => {
          if (!current) return current

          return options.optimisticUpdate(current, payload)
        },
        { revalidate: false }
      )

      try {
        await options.mutationFn(payload)

        if (options.successMessage) {
          toast.success(options.successMessage)
        }

        mutate(options.key)
      } catch {
        mutate(options.key)

        toast.error(options.errorMessage ?? 'Action failed. Please try again.')
      } finally {
        inflightRef.current = false

        if (lk) stopLoading(lk)
      }
    },
    [mutate, options, startLoading, stopLoading]
  )

  return { execute }
}
