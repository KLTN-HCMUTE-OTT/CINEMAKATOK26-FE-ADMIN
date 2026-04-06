// React Imports
import { useState, useEffect } from 'react'

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
  const [data, setData] = useState<ViewStatsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const searchField = tabValue === 2 ? 'categoryName' : 'title'
        const params = {
          page: page + 1, // API uses 1-based pagination
          limit: rowsPerPage,
          ...(searchQuery && { search: JSON.stringify({ [searchField]: searchQuery }) })
        }

        let response: any

        switch (tabValue) {
          case 0: // Movies
            response = await analyticsControllerGetMoviesStats(params)
            break
          case 1: // TV Series
            response = await analyticsControllerGetTvSeriesStats(params)
            break
          case 2: // Categories
            response = await analyticsControllerGetCategoriesStats(params)
            break
          default:
            setData([])
            setTotalItems(0)
            return
        }

        // Extract data from response
        const responseData = response.data?.data || []
        const meta = response.data?.meta || { total: 0 }
        console.log('Fetched view statistics:', meta)
        setData(responseData)
        setTotalItems(meta.totalItems || 0)
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch data')
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
