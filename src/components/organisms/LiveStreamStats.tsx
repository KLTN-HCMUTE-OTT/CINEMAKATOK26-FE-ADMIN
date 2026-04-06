'use client'

// MUI Imports
import { Box, Typography, Card, CardContent, Grid } from '@mui/material'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

interface LiveStreamStatsProps {
  streams: any[]
}

const LiveStreamStats = ({ streams }: LiveStreamStatsProps) => {
  const liveCount = streams.filter(s => s.status === 'live').length
  const totalViewers = streams.filter(s => s.status === 'live').reduce((sum, s) => sum + s.viewers, 0)
  const scheduledCount = streams.filter(s => s.status === 'scheduled').length
  const totalStreams = streams.length

  const stats = [
    {
      title: 'Live Streams',
      value: liveCount,
      icon: 'ri-live-line',
      color: 'error'
    },
    {
      title: 'Total Viewers',
      value: formatNumber(totalViewers),
      icon: 'ri-eye-line',
      color: 'primary'
    },
    {
      title: 'Scheduled',
      value: scheduledCount,
      icon: 'ri-calendar-line',
      color: 'warning'
    },
    {
      title: 'Total Streams',
      value: totalStreams,
      icon: 'ri-video-line',
      color: 'info'
    }
  ]

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 600, color: `${stat.color}.main` }}>
                    {stat.value}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {stat.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: `${stat.color}.light`,
                    borderRadius: 2,
                    p: 1,
                    color: `${stat.color}.main`
                  }}
                >
                  <i className={`${stat.icon} text-xl`} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default LiveStreamStats
