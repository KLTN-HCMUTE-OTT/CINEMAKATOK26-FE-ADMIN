import { useState } from 'react'

import { useUserStatistics } from '@/hooks/useUserStatistics'

interface UserStatisticsControllerParams {
  exportToExcel?: (data: any[], headers: string[], fileName: string, sheetName: string) => void
}

export function useUserStatisticsController({ exportToExcel }: UserStatisticsControllerParams) {
  const [tabValue, setTabValue] = useState(0)

  const { data: userStatsData, loading, error } = useUserStatistics()

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleExport = () => {
    if (!userStatsData || !exportToExcel) return

    if (tabValue === 0) {
      const dauHeaders = ['Day', 'Active Users', 'Trend', 'Distribution %']
      const dauData = (userStatsData.userMetrics?.dau || []).map((row: API.DAUMetricDto) => ({
        Day: row.day,
        'Active Users': row.users,
        Trend: row.trend,
        'Distribution %': Math.round((row.users / (userStatsData.summary?.totalUsers || 55400)) * 100)
      }))
      exportToExcel(dauData, dauHeaders, 'UserStatistics_DAU', 'DAU')
      return
    }

    if (tabValue === 1) {
      const mauHeaders = ['Month', 'Active Users', 'Change', 'Growth %']
      const mauData = (userStatsData.userMetrics?.mau || []).map((row: API.MAUMetricDto) => ({
        Month: row.month,
        'Active Users': row.users,
        Change: row.change,
        'Growth %': Math.round((row.users / (userStatsData.summary?.totalUsers || 152845)) * 100)
      }))
      exportToExcel(mauData, mauHeaders, 'UserStatistics_MAU', 'MAU')
      return
    }

    const churnHeaders = ['Month', 'Churn Rate (%)', 'Trend', 'Status']
    const churnData = (userStatsData.userMetrics?.churnRate || []).map((row: API.ChurnRateMetricDto) => ({
      Month: row.month,
      'Churn Rate (%)': row.rate,
      Trend: row.trend === 'down' ? 'Improving' : 'Worsening',
      Status: row.rate > 3 ? 'Critical' : row.rate > 2 ? 'Warning' : 'Healthy'
    }))
    exportToExcel(churnData, churnHeaders, 'UserStatistics_ChurnRate', 'ChurnRate')
  }

  return {
    tabValue,
    userStatsData,
    loading,
    error,
    handleTabChange,
    handleExport
  }
}
