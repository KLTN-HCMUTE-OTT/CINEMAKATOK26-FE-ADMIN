'use client'

import { Box, Button, IconButton, Slider, Tooltip, Typography } from '@mui/material'
import type { VideoState } from '@/types/watchPartyRoom'

interface PlaybackControlsProps {
  videoState: VideoState | null
  onPlay?: () => void
  onPause?: () => void
  onSeek?: (time: number) => void
  onPlayNext?: () => void
}

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const PlaybackControls = ({ videoState, onPlay, onPause, onSeek, onPlayNext }: PlaybackControlsProps) => {
  if (!videoState) return null

  const { isPlaying, currentTime } = videoState

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
      <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
        <IconButton
          size='small'
          onClick={isPlaying ? onPause : onPlay}
        >
          <i className={isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} />
        </IconButton>
      </Tooltip>

      <Tooltip title='Play Next'>
        <IconButton size='small' onClick={onPlayNext}>
          <i className='ri-skip-forward-fill' />
        </IconButton>
      </Tooltip>

      <Typography variant='caption' sx={{ minWidth: 40, fontFamily: 'monospace' }}>
        {formatTime(currentTime)}
      </Typography>

      <Slider
        size='small'
        value={currentTime}
        min={0}
        max={3600}
        step={1}
        onChange={(_, v) => onSeek?.(v as number)}
        sx={{ flex: 1, mx: 1 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <i
          className={videoState.status === 'awaiting_host' ? 'ri-pause-circle-line' : 'ri-checkbox-circle-line'}
          style={{ fontSize: 14, color: videoState.status === 'awaiting_host' ? '#f59e0b' : '#22c55e' }}
        />
        <Typography variant='caption' color='text.secondary'>
          {videoState.status === 'awaiting_host' ? 'Awaiting host' : 'Live'}
        </Typography>
      </Box>
    </Box>
  )
}

export default PlaybackControls
