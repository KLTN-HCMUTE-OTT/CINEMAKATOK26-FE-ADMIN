'use client'

// MUI Imports
import { Box, Typography, IconButton, Avatar } from '@mui/material'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Episode Info Cell
export const EpisodeInfoCell = ({ episode }: { episode: any }) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    <Avatar
      src={episode.thumbnail}
      alt={episode.title}
      sx={{ width: 60, height: 40, borderRadius: 1 }}
      variant='rounded'
    />
    <Box>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        E{episode.episodeNumber}: {episode.title}
      </Typography>
      <Typography variant='caption' color='text.secondary' noWrap>
        {episode.description?.substring(0, 50)}...
      </Typography>
    </Box>
  </Box>
)

// Season Episode Cell
export const SeasonEpisodeCell = ({ season, episodeNumber }: { season: number; episodeNumber: number }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      S{season}E{episodeNumber.toString().padStart(2, '0')}
    </Typography>
  </Box>
)

// Duration Views Cell
export const DurationViewsCell = ({ duration, views }: { duration: string; views: number }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {duration}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {formatNumber(views)} views
    </Typography>
  </Box>
)

// Rating Cell
export const RatingCell = ({ rating, likes, dislikes }: { rating: number; likes: number; dislikes: number }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {rating}/10 ★
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {formatNumber(likes)}👍 {formatNumber(dislikes)}👎
    </Typography>
  </Box>
)

// Episode Actions Cell
export const EpisodeActionsCell = ({
  episode,
  onEdit,
  onView,
  onDelete,
  onManageAssets
}: {
  episode: any
  onEdit: (episode: any) => void
  onView: (episode: any) => void
  onDelete: (id: number) => void
  onManageAssets: (episode: any) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onView(episode)} title='Preview Episode'>
      <i className='ri-play-circle-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onManageAssets(episode)} title='Manage Assets'>
      <i className='ri-file-video-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onEdit(episode)} title='Edit Episode'>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(episode.id)} title='Delete Episode'>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)
