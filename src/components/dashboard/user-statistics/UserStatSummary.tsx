import { Box, Grid, Typography } from '@mui/material'

interface UserStatSummaryProps {
  summary?: {
    totalUsers?: number
    activeUsers?: number
    newUsers?: number
    churnRate?: number
  }
}

const UserStatSummary = ({ summary }: UserStatSummaryProps) => {
  const activeRate =
    summary?.totalUsers && summary?.activeUsers ? ((summary.activeUsers / summary.totalUsers) * 100).toFixed(1) : '0'

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Total Users
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
              {summary?.totalUsers?.toLocaleString() || '0'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'success.main' }}>
              Active platform
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Active Users
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
              {summary?.activeUsers?.toLocaleString() || '0'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'info.main' }}>
              {activeRate}% of total
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              New Users (30d)
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
              {summary?.newUsers?.toLocaleString() || '0'}
            </Typography>
            <Typography variant='caption' sx={{ color: 'warning.main' }}>
              Monthly acquisition
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Churn Rate
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
              {summary?.churnRate || '0'}%
            </Typography>
            <Typography variant='caption' sx={{ color: 'error.main' }}>
              Monthly churn
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default UserStatSummary
