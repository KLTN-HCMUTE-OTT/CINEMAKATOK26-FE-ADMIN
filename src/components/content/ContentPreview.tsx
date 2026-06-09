'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Card, CardContent, Typography, IconButton, LinearProgress, Slider, Tooltip, Button } from '@mui/material'

interface ContentPreviewProps {
  title: string
  poster: string
  videoUrl?: string
  duration?: string
}

const ContentPreview = ({ title, poster, duration = '2h 15m' }: ContentPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const totalDuration = 135 // minutes (2h 15m)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (event: Event, newValue: number | number[]) => {
    setCurrentTime(newValue as number)
  }

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    setVolume(newValue as number)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ position: 'relative', aspectRatio: '16/9', backgroundColor: 'black' }}>
        {/* Video/Poster Display */}
        <Box
          component='img'
          src={poster}
          alt={title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isPlaying ? 'none' : 'block'
          }}
        />

        {/* Video Player Simulation */}
        {isPlaying && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <i className='ri-play-circle-line' style={{ fontSize: '4rem', marginBottom: '1rem' }} />
              <Typography variant='h6'>Playing: {title}</Typography>
              <LinearProgress
                variant='determinate'
                value={(currentTime / totalDuration) * 100}
                sx={{ mt: 2, width: 200 }}
              />
            </Box>
          </Box>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={handlePlayPause}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <i className='ri-play-fill' style={{ fontSize: '2rem', marginLeft: '4px' }} />
            </Box>
          </Box>
        )}

        {/* Video Controls */}
        {isPlaying && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              p: 2
            }}
          >
            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Slider
                size='small'
                value={currentTime}
                min={0}
                max={totalDuration}
                onChange={handleSeek}
                sx={{
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant='caption'>{formatTime(currentTime)}</Typography>
                <Typography variant='caption'>{duration}</Typography>
              </Box>
            </Box>

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                  <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
                    <i className={isPlaying ? 'ri-pause-fill' : 'ri-play-fill'} />
                  </IconButton>
                </Tooltip>

                <Tooltip title='Skip Forward 10s'>
                  <IconButton
                    onClick={() => setCurrentTime(prev => Math.min(prev + 10, totalDuration))}
                    sx={{ color: 'white' }}
                  >
                    <i className='ri-skip-forward-fill' />
                  </IconButton>
                </Tooltip>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                  <IconButton sx={{ color: 'white', p: 0.5 }}>
                    <i className='ri-volume-up-line' />
                  </IconButton>
                  <Slider
                    size='small'
                    value={volume}
                    onChange={handleVolumeChange}
                    sx={{ width: 80, color: 'white' }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title='Quality'>
                  <Button variant='outlined' size='small' sx={{ color: 'white', borderColor: 'white' }}>
                    1080p
                  </Button>
                </Tooltip>

                <Tooltip title='Subtitles'>
                  <IconButton sx={{ color: 'white' }}>
                    <i className='ri-subtitles-line' />
                  </IconButton>
                </Tooltip>

                <Tooltip title='Fullscreen'>
                  <IconButton onClick={() => setIsFullscreen(!isFullscreen)} sx={{ color: 'white' }}>
                    <i className='ri-fullscreen-line' />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <CardContent>
        <Typography variant='h6' sx={{ mb: 1 }}>
          Content Preview
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Preview how this content will appear to users on the platform
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ContentPreview
