import React from 'react'

// MUI Imports
import { Dialog, DialogTitle, DialogContent, Box, Typography, Button } from '@mui/material'

// Types

interface DialogTrailerProps {
  title: string
  trailerUrl: string
  trailerDialogOpen: boolean
  setTrailerDialogOpen: (open: boolean) => void
}

export const DialogTrailer = ({ title, trailerUrl, trailerDialogOpen, setTrailerDialogOpen }: DialogTrailerProps) => {
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

  return (
    <Dialog open={trailerDialogOpen} onClose={() => setTrailerDialogOpen(false)} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>Trailer - {title}</Typography>
          <Button onClick={() => setTrailerDialogOpen(false)}>
            <i className='ri-close-line' />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        {trailerUrl && (
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {isYouTubeUrl(trailerUrl) ? (
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(trailerUrl)}?autoplay=1&rel=0&modestbranding=1`}
                title='YouTube Trailer'
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                allowFullScreen
                referrerPolicy='strict-origin-when-cross-origin'
              />
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
                autoPlay
              >
                <source src={trailerUrl} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
