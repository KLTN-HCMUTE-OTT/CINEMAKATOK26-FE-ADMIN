import useSWR from 'swr'

// API Imports
import {
  analyticsControllerGetCategoriesStats,
  analyticsControllerGetMoviesStats,
  analyticsControllerGetTvSeriesStats
} from '@/api/analytics'

interface UseViewStatisticsProps {
  tabValue: number
  page: number
  rowsPerPage: number
  searchQuery: string
}

interface ViewStatsItem {
  id: number
  title?: string
  name?: string
  views: number
  trending: 'up' | 'down'
  change: string
  percentage: number
}

export const useViewStatistics = ({ tabValue, page, rowsPerPage, searchQuery }: UseViewStatisticsProps) => {
  const key = ['view-statistics', { tabValue, page, rowsPerPage, searchQuery }] as const

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, params]) => {
      const searchField = params.tabValue === 2 ? 'categoryName' : 'title'

      const requestParams = {
        page: params.page + 1,
        limit: params.rowsPerPage,
        ...(params.searchQuery && { search: JSON.stringify({ [searchField]: params.searchQuery }) })
      }

      let response: any

      switch (params.tabValue) {
        case 0:
          response = await analyticsControllerGetMoviesStats(requestParams)
          break
        case 1:
          response = await analyticsControllerGetTvSeriesStats(requestParams)
          break
        case 2:
          response = await analyticsControllerGetCategoriesStats(requestParams)
          break
        default:
          return { items: [] as ViewStatsItem[], totalItems: 0 }
      }

      return {
        items: (response.data?.data || []) as ViewStatsItem[],
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
