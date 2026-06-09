'use client'

// MUI Imports
import { Grid, Card, CardContent, Typography } from '@mui/material'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

interface EpisodeStatsProps {
  episodes: any[]
}

const EpisodeStats = ({ episodes }: EpisodeStatsProps) => {
  // Calculate stats
  const totalEpisodes = episodes.length
  const publishedEpisodes = episodes.filter(e => e.status === 'published').length
  const totalViews = episodes.reduce((sum, ep) => sum + ep.views, 0)
  const avgRating = episodes.filter(e => e.rating > 0).reduce((sum, ep, _, arr) => sum + ep.rating / arr.length, 0)

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'primary.main' }}>
              {totalEpisodes}
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
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'success.main' }}>
              {publishedEpisodes}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Published Episodes
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'info.main' }}>
              {formatNumber(totalViews)}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Total Views
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant='h4' sx={{ fontWeight: 600, color: 'warning.main' }}>
              {avgRating ? avgRating.toFixed(1) : '0'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Average Rating
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EpisodeStats
