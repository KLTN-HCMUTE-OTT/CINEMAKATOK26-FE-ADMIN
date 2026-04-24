'use client'

// React Imports
import React from 'react'

// MUI Imports
import { Card, CardHeader, CardContent, Box, CircularProgress, Button, Alert } from '@mui/material'

import { useUserStatisticsController } from '../../hooks/useUserStatisticsController'
import UserMetricTabs from './user-statistics/UserMetricTabs'
import UserMetricsTable from './user-statistics/UserMetricsTable'
import UserStatSummary from './user-statistics/UserStatSummary'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

interface UserStatisticsProps {
  exportToExcel?: (data: any[], headers: string[], fileName: string, sheetName: string) => void
  exportMultipleSheets?: (sheetsData: any[], fileName: string) => void
}

const UserStatistics = ({ exportToExcel, exportMultipleSheets }: UserStatisticsProps) => {
  void exportMultipleSheets

  const { tabValue, userStatsData, loading, error, handleTabChange, handleExport } = useUserStatisticsController({
    exportToExcel
  })

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='User Statistics'
        subheader='Track user growth and subscription plans'
        avatar={<i className='ri-team-line' style={{ fontSize: '24px', color: '#10b981' }} />}
        action={
          <Button
            onClick={handleExport}
            variant='outlined'
            size='small'
            startIcon={<i className='ri-file-excel-2-line' />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Export CSV
          </Button>
        }
      />

      <CardContent>
        {/* Error Alert */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <UserStatSummary summary={userStatsData?.summary} />

        <UserMetricTabs tabValue={tabValue} onTabChange={handleTabChange} />

        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='250px'>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <UserMetricsTable tabValue={tabValue} userStatsData={userStatsData} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <UserMetricsTable tabValue={tabValue} userStatsData={userStatsData} />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <UserMetricsTable tabValue={tabValue} userStatsData={userStatsData} />
            </TabPanel>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default UserStatistics
