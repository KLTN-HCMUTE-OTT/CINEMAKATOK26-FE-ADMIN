'use client'

import useSWR from 'swr'
import { auditLogControllerGetRecentActivity } from '@/api/auditLogs'

interface UseRecentActivityProps {
  limit?: number
  page?: number
}

export const useRecentActivity = ({ limit = 10, page = 1 }: UseRecentActivityProps = {}) => {
  const key = ['recent-activity', { limit, page }] as const

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, params]) => {
      const response = await auditLogControllerGetRecentActivity({
        limit: params.limit,
        page: params.page
      })

      if (response.data?.statusCode !== 200) {
        throw new Error('Failed to fetch recent activity')
      }

      return {
        items: response.data.data || [],
        totalItems: response.data.meta?.totalItems || 0
      }
    },
    {
      revalidateOnFocus: false
    }
  )

  return {
    data: data?.items ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    totalItems: data?.totalItems ?? 0,
    refetch: () => mutate()
  }
}
