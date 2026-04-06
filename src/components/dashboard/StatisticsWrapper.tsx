'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Button, ButtonGroup, Grid, Typography } from '@mui/material'

// Components Imports
import ViewStatistics from './ViewStatistics'
import UserStatistics from './UserStatistics'
import TrendingStatistics from './TrendingStatistics'

// Hooks Imports
import { useExportToExcel } from '@/hooks/useExportToExcel'

type StatisticsView = 'view' | 'user' | 'trending'

const StatisticsWrapper = () => {
  const [activeView, setActiveView] = useState<StatisticsView>('view')
  const { exportToExcel, exportMultipleSheets } = useExportToExcel()

  const renderContent = () => {
    switch (activeView) {
      case 'view':
        return <ViewStatistics exportToExcel={exportToExcel} />
      case 'user':
        return <UserStatistics exportToExcel={exportToExcel} exportMultipleSheets={exportMultipleSheets} />
      case 'trending':
        return <TrendingStatistics exportToExcel={exportToExcel} />
      default:
        return <ViewStatistics exportToExcel={exportToExcel} />
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
            Detailed Statistics
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Comprehensive analysis of your platform performance
          </Typography>
        </Box>

        {/* View Switcher */}
        <ButtonGroup variant='outlined' size='small'>
          <Button
            onClick={() => setActiveView('view')}
            variant={activeView === 'view' ? 'contained' : 'outlined'}
            startIcon={<i className='ri-bar-chart-2-line' />}
          >
            Views
          </Button>
          <Button
            onClick={() => setActiveView('user')}
            variant={activeView === 'user' ? 'contained' : 'outlined'}
            startIcon={<i className='ri-team-line' />}
          >
            Users
          </Button>
          <Button
            onClick={() => setActiveView('trending')}
            variant={activeView === 'trending' ? 'contained' : 'outlined'}
            startIcon={<i className='ri-fire-line' />}
          >
            Trending
          </Button>
        </ButtonGroup>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {renderContent()}
        </Grid>
      </Grid>
    </Box>
  )
}

export default StatisticsWrapper
