'use client'

import { Box, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from '@mui/material'

import type { QueueItem } from '@/types/watchPartyRoom'

interface QueuePanelProps {
  queue: QueueItem[]
  onRemove?: (index: number) => void
  onPlayNow?: (item: QueueItem) => void
}

const QueuePanel = ({ queue, onRemove, onPlayNow }: QueuePanelProps) => {
  if (queue.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color='text.secondary' variant='body2'>
          Queue is empty
        </Typography>
      </Box>
    )
  }

  return (
    <List dense disablePadding>
      {queue.map((item, idx) => (
        <ListItem
          key={`${item.videoId}-${idx}`}
          sx={{ borderRadius: 1, mb: 0.5, bgcolor: 'action.hover' }}
          secondaryAction={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title='Play Now'>
                <IconButton size='small' onClick={() => onPlayNow?.(item)}>
                  <i className='ri-play-fill' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Remove'>
                <IconButton size='small' onClick={() => onRemove?.(idx)} color='error'>
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <ListItemText
            primary={
              <Typography variant='body2' sx={{ fontWeight: 500 }} noWrap>
                {idx + 1}. {item.title}
              </Typography>
            }
            secondary={item.durationSec ? `${Math.floor(item.durationSec / 60)}m` : undefined}
          />
        </ListItem>
      ))}
    </List>
  )
}

export default QueuePanel
