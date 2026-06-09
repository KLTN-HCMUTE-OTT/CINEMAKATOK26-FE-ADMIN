'use client'

import { Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material'

interface WatchPartyStatsCardsProps {
  stats: API.WatchPartyStatsResponse | null
  loading: boolean
  onRefresh?: () => void
}

const StatCard = ({
  icon,
  label,
  value,
  color,
  loading
}: {
  icon: string
  label: string
  value: number
  color: string
  loading: boolean
}) => (
  <Card
    sx={{
      borderLeft: `4px solid`,
      borderColor: color,
      height: '100%',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: 4 }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={40} />
          ) : (
            <Typography variant='h4' sx={{ fontWeight: 700, color }}>
              {value.toLocaleString()}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}1A`
          }}
        >
          <i className={icon} style={{ fontSize: 24, color }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const WatchPartyStatsCards = ({ stats, loading }: WatchPartyStatsCardsProps) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <StatCard
          icon='ri-broadcast-line'
          label='Active Rooms'
          value={stats?.totalActiveRooms ?? 0}
          color='#7367f0'
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatCard
          icon='ri-group-line'
          label='Total Members'
          value={stats?.totalMembers ?? 0}
          color='#28c76f'
          loading={loading}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <StatCard
          icon='ri-earth-line'
          label='Public Rooms'
          value={stats?.totalPublicRooms ?? 0}
          color='#00cfe8'
          loading={loading}
        />
      </Grid>
    </Grid>
  )
}

export default WatchPartyStatsCards
