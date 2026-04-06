'use client'

import { useState, useEffect } from 'react'
import { auditLogControllerGetRecentActivity } from '@/api/auditLogs'

interface UseRecentActivityProps {
  limit?: number
  page?: number
}

export const useRecentActivity = ({ limit = 10, page = 1 }: UseRecentActivityProps = {}) => {
  const [data, setData] = useState<API.RecentActivityDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await auditLogControllerGetRecentActivity({
        limit,
        page
      })

      if (response.data?.statusCode === 200) {
        setData(response.data.data)
        setTotalItems(response.data.meta?.totalItems || 0)
      } else {
        setError('Failed to fetch recent activity')
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch recent activity'
      setError(errorMessage)
      console.error('Error fetching recent activity:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentActivity()
  }, [limit, page])

  return {
    data,
    loading,
    error,
    totalItems,
    refetch: fetchRecentActivity
  }
}
