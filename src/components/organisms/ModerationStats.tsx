'use client'

// MUI Imports
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'

interface ModerationStatsProps {
  reports: any[]
}

const ModerationStats = ({ reports }: ModerationStatsProps) => {
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    highPriority: reports.filter(r => r.priority === 'high' && r.status === 'pending').length
  }

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.total,
      icon: 'ri-file-list-line',
      color: 'primary'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: 'ri-time-line',
      color: 'warning'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: 'ri-check-double-line',
      color: 'success'
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: 'ri-alarm-warning-line',
      color: 'error'
    }
  ]

  return (
    <Grid container spacing={3}>
      {statCards.map((stat, index) => (
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

export default ModerationStats
