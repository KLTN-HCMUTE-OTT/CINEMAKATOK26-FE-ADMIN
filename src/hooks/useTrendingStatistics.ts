// React Imports
import { useState, useEffect } from 'react'

// API Imports
import { analyticsControllerGetTrendingMovies, analyticsControllerGetTrendingTvSeries } from '@/api/analytics'

interface UseTrendingStatisticsProps {
  tabValue: number
  page: number
  rowsPerPage: number
  searchQuery: string
}

export const useTrendingStatistics = ({ tabValue, page, rowsPerPage, searchQuery }: UseTrendingStatisticsProps) => {
  const [data, setData] = useState<API.TrendingItemDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = {
          page: page + 1, // API uses 1-based pagination
          limit: rowsPerPage,
          ...(searchQuery && { search: JSON.stringify({ title: searchQuery }) })
        }

        let response: any

        switch (tabValue) {
          case 0: // Movies
            response = await analyticsControllerGetTrendingMovies(params)
            break
          case 1: // TV Series
            response = await analyticsControllerGetTrendingTvSeries(params)
            break
          default:
            setData([])
            setTotalItems(0)
            return
        }

        // Extract data from response
        const responseData = response.data?.data || []
        const meta = response.data?.meta || { totalItems: 0 }
        console.log('Fetched trending statistics:', meta)
        setData(responseData)
        setTotalItems(meta.totalItems || 0)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch trending data')
        setData([])
        setTotalItems(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tabValue, page, rowsPerPage, searchQuery])

  return {
    data,
    loading,
    error,
    totalItems
  }
}
