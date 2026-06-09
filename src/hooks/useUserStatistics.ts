import useSWR from 'swr'

// API Imports
import { analyticsControllerGetUserStats } from '@/api/analytics'

export const useUserStatistics = () => {
  const { data, error, isLoading, mutate } = useSWR(
    ['user-statistics'],
    async () => {
      const response = await analyticsControllerGetUserStats()

      return (response.data?.data || null) as API.UserStatsDto | null
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 3
    }
  )

  return {
    data,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => mutate()
  }
}
