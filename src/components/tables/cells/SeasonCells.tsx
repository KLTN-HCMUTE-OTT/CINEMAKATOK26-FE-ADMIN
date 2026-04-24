'use client'

// MUI Imports
import { Box, Typography, IconButton } from '@mui/material'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

export const SeasonInfoCell = ({ season }: { season: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      Season {season.seasonNumber}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {season.title}
    </Typography>
  </Box>
)

export const EpisodeCountCell = ({ episodes, totalDuration }: { episodes: number; totalDuration?: string }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {formatNumber(episodes)} episodes
    </Typography>
    {totalDuration && (
      <Typography variant='caption' color='text.secondary'>
        {totalDuration} total
      </Typography>
    )}
  </Box>
)

export const SeasonStatsCell = ({ stats }: { stats: any }) => (
  <Box>
    <Typography variant='body2'>{formatNumber(stats.views)} views</Typography>
    <Typography variant='caption' color='text.secondary'>
      Avg: {stats.avgRating}/10 ★
    </Typography>
  </Box>
)

export const SeasonActionsCell = ({
  season,
  onEdit,
  onView,
  onDelete,
  onManageEpisodes
}: {
  season: any
  onEdit: (season: any) => void
  onView: (season: any) => void
  onDelete: (id: number) => void
  onManageEpisodes: (season: any) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onView(season)} title='View Details'>
      <i className='ri-eye-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onManageEpisodes(season)} title='Manage Episodes'>
      <i className='ri-play-list-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onEdit(season)} title='Edit Season'>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton
      size='small'
      color='error'
      onClick={() => onDelete(season.id)}
      title='Delete Season'
      disabled={season.episodes > 0}
    >
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)
