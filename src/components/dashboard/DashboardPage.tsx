'use client'

import { useCallback, useMemo, useState } from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import DataTable from '@components/shared/DataTable'
import StatisticsWrapper from '@components/dashboard/StatisticsWrapper'

import { useRecentActivity } from '@/hooks/useRecentActivity'

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

export default function DashboardPage() {
  const [activityPage, setActivityPage] = useState(0)
  const [activityRowsPerPage, setActivityRowsPerPage] = useState(10)

  const {
    data: recentActivityData,
    loading: activityLoading,
    error: activityError,
    totalItems: activityTotalItems
  } = useRecentActivity({
    limit: activityRowsPerPage,
    page: activityPage + 1
  })

  const formattedActivityData = useMemo(
    () =>
      recentActivityData.map((activity: API.RecentActivityDto) => ({
        id: activity.id,
        user: activity.userName,
        action: activity.action || 'Unknown Action',
        details:
          activity.description && activity.description.trim() ? activity.description : 'No description available',
        timestamp: new Date(activity.createdAt).toLocaleString()
      })),
    [recentActivityData]
  )

  const activityRows = useMemo(
    () =>
      formattedActivityData.map(row => ({
        ...row,
        details: <DetailsCell row={row} />
      })),
    [formattedActivityData]
  )

  const handleActivityPageChange = useCallback((newPage: number) => {
    setActivityPage(newPage)
  }, [])

  const handleActivityRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setActivityRowsPerPage(newRowsPerPage)
    setActivityPage(0)
  }, [])

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Overview
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Welcome to your OTT streaming platform dashboard
        </Typography>
      </Box>

      <Grid container spacing={6}>
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
            rows={activityRows}
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

        <Grid item xs={12} sx={{ mt: 4 }}>
          <StatisticsWrapper />
        </Grid>
      </Grid>
    </Box>
  )
}
