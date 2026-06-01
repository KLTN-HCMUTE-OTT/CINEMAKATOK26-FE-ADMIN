import React from 'react'

// MUI Imports
import { Dialog, DialogTitle, DialogContent, Box, Typography, Button } from '@mui/material'

import { getS3Url } from '@/configs/aws'
import { DynamicHLSVideoPlayer, DynamicShakaVideoPlayer } from '@/utils/dynamicImports'

// Video Player Imports

interface DialogVideoProps {
  title: string
  thumbnailUrl?: string
  video: API.VideoDto | null
  videoDialogOpen: boolean
  setVideoDialogOpen: (open: boolean) => void
}

export const DialogVideo = ({ title, video, thumbnailUrl, videoDialogOpen, setVideoDialogOpen }: DialogVideoProps) => {
  const isHLSUrl = (url?: string): boolean => {
    if (!url) {
      return false
    }

    return url.endsWith('.m3u8')
  }

  return (
    <Dialog open={videoDialogOpen} onClose={() => setVideoDialogOpen(false)} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{title}</Typography>
          <Button onClick={() => setVideoDialogOpen(false)}>
            <i className='ri-close-line' />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        {video?.videoUrl && (
          <Box
            sx={{
              position: 'relative',
              paddingTop: '56.25%',
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {video.id ? (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <DynamicShakaVideoPlayer videoId={video.id} poster={thumbnailUrl} />
              </div>
            ) : isHLSUrl(video.videoUrl) ? (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <DynamicHLSVideoPlayer src={getS3Url(video.videoUrl)} poster={thumbnailUrl} controls autoPlay />
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
                autoPlay
                poster={thumbnailUrl}
              >
                <source src={getS3Url(video.videoUrl)} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
