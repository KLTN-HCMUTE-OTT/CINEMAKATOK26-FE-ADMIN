'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// Component Imports
import { DynamicHLSVideoPlayer } from '@/utils/dynamicImports'

interface TrailerSectionProps {
  trailer: string
  onTrailerChange: (value: string) => void
  onRemoveTrailer: () => void
}

const TrailerSection = ({ trailer, onTrailerChange, onRemoveTrailer }: TrailerSectionProps) => {
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  // Check if URL is HLS
  const isHLSUrl = (url: string): boolean => {
    return url.endsWith('.m3u8')
  }

  return (
    <Grid item xs={12} sm={6}>
      <Box>
        <TextField
          fullWidth
          label='Trailer URL'
          value={trailer}
          onChange={e => onTrailerChange(e.target.value)}
          placeholder='https://www.youtube.com/watch?v=... or https://...'
          helperText='Enter YouTube URL or direct video URL'
        />
        {trailer && (
          <Box mt={2}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#000',
                mb: 2
              }}
            >
              {isYouTubeUrl(trailer) ? (
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(trailer)}?rel=0&modestbranding=1`}
                  title='YouTube Trailer'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  allowFullScreen
                  referrerPolicy='strict-origin-when-cross-origin'
                />
              ) : isHLSUrl(trailer) ? (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  <DynamicHLSVideoPlayer src={trailer} controls />
                </div>
              ) : (
                <video
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                  controls
                >
                  <source src={trailer} type='video/mp4' />
                </video>
              )}
            </Box>
            <Box display='flex' gap={1}>
              <Button
                variant='outlined'
                size='small'
                startIcon={<i className='ri-play-line' />}
                onClick={() => window.open(trailer, '_blank')}
              >
                {isYouTubeUrl(trailer) ? 'Watch on YouTube' : 'Play'}
              </Button>
              <Button
                variant='outlined'
                size='small'
                color='error'
                startIcon={<i className='ri-delete-bin-line' />}
                onClick={onRemoveTrailer}
              >
                Remove
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Grid>
  )
}

export default TrailerSection
