import useSWR from 'swr'

// API Imports
import { analyticsControllerGetTrendingMovies, analyticsControllerGetTrendingTvSeries } from '@/api/analytics'

interface UseTrendingStatisticsProps {
  tabValue: number
  page: number
  rowsPerPage: number
  searchQuery: string
}

export const useTrendingStatistics = ({ tabValue, page, rowsPerPage, searchQuery }: UseTrendingStatisticsProps) => {
  const key = ['trending-statistics', { tabValue, page, rowsPerPage, searchQuery }] as const

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, params]) => {
      const requestParams = {
        page: params.page + 1,
        limit: params.rowsPerPage,
        ...(params.searchQuery && { search: JSON.stringify({ title: params.searchQuery }) })
      }

      let response: any

      switch (params.tabValue) {
        case 0:
          response = await analyticsControllerGetTrendingMovies(requestParams)
          break
        case 1:
          response = await analyticsControllerGetTrendingTvSeries(requestParams)
          break
        default:
          return { items: [] as API.TrendingItemDto[], totalItems: 0 }
      }

      return {
        items: (response.data?.data || []) as API.TrendingItemDto[],
        totalItems: response.data?.meta?.totalItems || 0
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
    refetch: () => mutate()
  }
}
