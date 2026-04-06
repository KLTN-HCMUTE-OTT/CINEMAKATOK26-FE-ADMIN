'use client'

// MUI Imports
import { Grid, Card, CardContent, Typography } from '@mui/material'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

interface SeasonStatsProps {
  seasons: any[]
}

const SeasonStats = ({ seasons }: SeasonStatsProps) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'primary.main' }}>
              {seasons.length}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Total Seasons
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'success.main' }}>
              {seasons.reduce((sum, season) => sum + season.episodes, 0)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Total Episodes
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'info.main' }}>
              {seasons.filter(s => s.status === 'published').length}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Published Seasons
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'warning.main' }}>
              {formatNumber(seasons.reduce((sum, season) => sum + season.stats.views, 0))}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Total Views
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default SeasonStats
