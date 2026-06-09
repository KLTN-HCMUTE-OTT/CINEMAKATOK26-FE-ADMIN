'use client'

import useSWR from 'swr'

import { reportControllerFindAll } from '@/api/reports'

interface UseReportsProps {
  limit?: number
  page?: number
  search?: string
  sort?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export const useReports = ({ limit = 10, page = 1, search, sort, status }: UseReportsProps = {}) => {
  const key = ['reports', { limit, page, search, sort, status }] as const

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, params]) => {
      const response = await reportControllerFindAll({
        limit: params.limit,
        page: params.page,
        search: params.search,
        sort: params.sort,
        status: params.status
      })

      if (!response.data) {
        throw new Error('Failed to fetch reports')
      }

      return {
        items: response.data.data || [],
        totalItems: response.data.meta?.totalItems || 0,
        totalPages: response.data.meta?.totalPages || 0
      }
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 3
    }
  )

  return {
    data: data?.items ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    refetch: () => mutate()
  }
}
