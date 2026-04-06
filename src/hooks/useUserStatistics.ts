// React Imports
import { useState, useEffect } from 'react'

// API Imports
import { analyticsControllerGetUserStats } from '@/api/analytics'

export const useUserStatistics = () => {
  const [data, setData] = useState<API.UserStatsDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        let response: any
        response = await analyticsControllerGetUserStats()
        // Extract data from response
        const responseData = response.data?.data
        setData(responseData)
        console.log('User statistics fetched:', responseData)
      } catch (err: any) {
        setError(err?.response?.data?.data.message || 'Failed to fetch user statistics')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return {
    data,
    loading,
    error
  }
}
