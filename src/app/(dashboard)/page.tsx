'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Components Imports
import KPICard from '@components/shared/KPICard'
import DataTable from '@components/shared/DataTable'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import LineChart from '@views/dashboard/LineChart'
import RealTimeMetrics from '@components/dashboard/RealTimeMetrics'
import StatisticsWrapper from '@components/dashboard/StatisticsWrapper'

// Hook Imports
import { useRecentActivity } from '@/hooks/useRecentActivity'

// Move this to a separate component to avoid serialization issues

const DetailsCell = ({ row }: { row: any }) => row.details || '-'

const activityColumns = [
  { id: 'user', label: 'User', minWidth: 150 },
  { id: 'action', label: 'Action', minWidth: 150 },
  {
    id: 'details',
    label: 'Details',
    minWidth: 150
  },
  { id: 'timestamp', label: 'Time', minWidth: 120 }
]

const OTTDashboard = () => {
  // Pagination state for recent activity
  const [activityPage, setActivityPage] = useState(0)
  const [activityRowsPerPage, setActivityRowsPerPage] = useState(10)

  // Use the recent activity hook with pagination
  const {
    data: recentActivityData,
    loading: activityLoading,
    error: activityError,
    totalItems: activityTotalItems
  } = useRecentActivity({
    limit: activityRowsPerPage,
    page: activityPage + 1 // API uses 1-based pagination, MUI uses 0-based
  })

  // Format activity data for the table
  const formattedActivityData = recentActivityData.map((activity: API.RecentActivityDto) => {
    return {
      id: activity.id,
      user: activity.userName,
      action: activity.action || 'Unknown Action',
      details: activity.description && activity.description.trim() ? activity.description : 'No description available',
      timestamp: new Date(activity.createdAt).toLocaleString()
    }
  })

  const handleActivityPageChange = (newPage: number) => {
    setActivityPage(newPage)
  }

  const handleActivityRowsPerPageChange = (newRowsPerPage: number) => {
    setActivityRowsPerPage(newRowsPerPage)
    setActivityPage(0) // Reset to first page when changing rows per page
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Overview
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Welcome to your OTT streaming platform dashboard
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Real-time Performance Metrics */}
        {/* <Grid item xs={12}>
          <RealTimeMetrics />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title='Total Users'
            value='152,845'
            change={{ value: '+12.5%', trend: 'up' }}
            icon='ri-group-line'
            iconColor='primary'
            subtitle='Active subscribers'
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title='Active Subscriptions'
            value='89,432'
            change={{ value: '+8.2%', trend: 'up' }}
            icon='ri-vip-crown-line'
            iconColor='success'
            subtitle='Paying customers'
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title='Total Revenue'
            value='$2.4M'
            change={{ value: '+15.3%', trend: 'up' }}
            icon='ri-money-dollar-circle-line'
            iconColor='info'
            subtitle='This month'
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title='Hours Watched'
            value='1.2M'
            change={{ value: '-2.1%', trend: 'down' }}
            icon='ri-play-circle-line'
            iconColor='warning'
            subtitle='Total watch time'
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <WeeklyOverview />
        </Grid>

        <Grid item xs={12} md={4}>
          <LineChart />
        </Grid> */}

        {/* Recent Activity Table */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant='h6' component='h2' sx={{ fontWeight: 600 }}>
              Recent Activity
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Latest user activities and system events
            </Typography>
          </Box>
          <DataTable
            rows={formattedActivityData.map(row => ({
              ...row,
              details: <DetailsCell row={row} />
            }))}
            emptyMessage={activityError ? `Error: ${activityError}` : 'No recent activity'}
            loading={activityLoading}
          >
            {activityColumns.map(column => (
              <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
            ))}
            <DataTable.Pagination
              totalCount={activityTotalItems}
              page={activityPage}
              rowsPerPage={activityRowsPerPage}
              onPageChange={handleActivityPageChange}
              onRowsPerPageChange={handleActivityRowsPerPageChange}
            />
          </DataTable>
        </Grid>

        {/* Detailed Statistics */}
        <Grid item xs={12} sx={{ mt: 4 }}>
          <StatisticsWrapper />
        </Grid>
      </Grid>
    </Box>
  )
}

export default OTTDashboard
