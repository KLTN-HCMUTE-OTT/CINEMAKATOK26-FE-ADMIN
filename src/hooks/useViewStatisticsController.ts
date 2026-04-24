import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useViewStatistics } from '@/hooks/useViewStatistics'

interface UseViewStatisticsControllerParams {
  exportToExcel?: (data: any[], headers: string[], fileName: string, sheetName: string) => void
}

export function useViewStatisticsController({ exportToExcel }: UseViewStatisticsControllerParams) {
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const router = useRouter()

  const {
    data: currentData,
    loading,
    error,
    totalItems
  } = useViewStatistics({
    tabValue,
    page,
    rowsPerPage,
    searchQuery
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPage(0)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleItemClick = (item: any) => {
    if (tabValue === 0) {
      router.push(`/content/movies/${item.id}`)
    } else if (tabValue === 1) {
      router.push(`/content/tvseries/${item.id}`)
    }
  }

  const handleExport = () => {
    const tabName = ['Movies', 'TV Series', 'Categories'][tabValue]
    const headers =
      tabValue === 2
        ? ['Name', 'Views', 'Trend', 'Change', 'Percentage']
        : ['Title', 'Views', 'Trend', 'Change', 'Percentage']

    if (exportToExcel && currentData) {
      const exportData = currentData.map((item: any) => ({
        ...item,
        Title: (item as any).title || (item as any).name,
        Name: (item as any).name || (item as any).title,
        Views: item.views,
        Trend: item.trending,
        Change: item.change,
        Percentage: item.percentage
      }))

      exportToExcel(exportData, headers, `ViewStatistics_${tabName}`, tabName)
    }
  }

  const totalViews = currentData?.reduce((sum, item) => sum + item.views, 0) || 0

  const getTopContentName = () => {
    if (!currentData || currentData.length === 0) return 'N/A'

    if (tabValue === 2) {
      return (currentData[0] as any)?.name || 'N/A'
    }

    return (currentData[0] as any)?.title || 'N/A'
  }

  return {
    tabValue,
    searchQuery,
    page,
    rowsPerPage,
    currentData,
    loading,
    error,
    totalItems,
    totalViews,
    topContentName: getTopContentName(),
    handleTabChange,
    handleSearchChange,
    handleChangePage,
    handleChangeRowsPerPage,
    handleItemClick,
    handleExport
  }
}
