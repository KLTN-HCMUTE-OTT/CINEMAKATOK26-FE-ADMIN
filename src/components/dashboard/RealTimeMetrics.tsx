'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { Box, Card, CardContent, Typography, Grid, LinearProgress } from '@mui/material'

// Components Imports
import { formatNumber } from '@/utils/formatNumber'

import KPICard from '@components/shared/KPICard'

// Utils Imports

interface RealTimeData {
  activeViewers: number
  concurrentStreams: number
  bandwidthUsage: number
  serverLoad: number
}

const RealTimeMetrics = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    activeViewers: 12548,
    concurrentStreams: 3429,
    bandwidthUsage: 75,
    serverLoad: 68
  })

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        activeViewers: prev.activeViewers + Math.floor(Math.random() * 100) - 50,
        concurrentStreams: prev.concurrentStreams + Math.floor(Math.random() * 20) - 10,
        bandwidthUsage: Math.max(0, Math.min(100, prev.bandwidthUsage + Math.floor(Math.random() * 6) - 3)),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.floor(Math.random() * 6) - 3))
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant='h6'>Real-time Performance</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                animation: 'pulse 2s infinite'
              }}
            />
            <Typography variant='caption' color='text.secondary'>
              Live
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title='Active Viewers'
          value={formatNumber(realTimeData.activeViewers)}
          icon='ri-eye-line'
          iconColor='primary'
          subtitle='Currently watching'
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title='Concurrent Streams'
          value={formatNumber(realTimeData.concurrentStreams)}
          icon='ri-play-circle-line'
          iconColor='info'
          subtitle='Active streams'
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant='h4' sx={{ fontWeight: 600, color: 'warning.main' }}>
                  {realTimeData.bandwidthUsage}%
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Bandwidth Usage
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'warning.light',
                  borderRadius: 2,
                  p: 1,
                  color: 'warning.main'
                }}
              >
                <i className='ri-wifi-line text-xl' />
              </Box>
            </Box>
            <LinearProgress
              variant='determinate'
              value={realTimeData.bandwidthUsage}
              color={realTimeData.bandwidthUsage > 80 ? 'error' : 'warning'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant='h4' sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  {realTimeData.serverLoad}%
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Server Load
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: 'secondary.light',
                  borderRadius: 2,
                  p: 1,
                  color: 'secondary.main'
                }}
              >
                <i className='ri-server-line text-xl' />
              </Box>
            </Box>
            <LinearProgress
              variant='determinate'
              value={realTimeData.serverLoad}
              color={realTimeData.serverLoad > 85 ? 'error' : 'secondary'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default RealTimeMetrics
