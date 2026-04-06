'use client'

import { useState, useEffect } from 'react'
import { reportControllerFindAll } from '@/api/reports'

interface UseReportsProps {
  limit?: number
  page?: number
  search?: string
  sort?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export const useReports = ({ limit = 10, page = 1, search, sort, status }: UseReportsProps = {}) => {
  const [data, setData] = useState<API.ReportDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await reportControllerFindAll({
        limit,
        page,
        search,
        sort,
        status
      })

      if (response.data) {
        console.log('Fetched reports:', response.data.data)
        setData(response.data.data || [])
        setTotalItems(response.data.meta?.totalItems || 0)
        setTotalPages(response.data.meta?.totalPages || 0)
      } else {
        setError('Failed to fetch reports')
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch reports'
      setError(errorMessage)
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [limit, page, search, sort, status])

  return {
    data,
    loading,
    error,
    totalItems,
    totalPages,
    refetch: fetchReports
  }
}
