'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

// Component Imports
import HLSVideoPlayer from '@/components/shared/HLSVideoPlayer'

// Utils
import { getS3Url } from '@/configs/aws'

interface VideoUploadSectionProps {
  videoFile: File | null
  currentVideoUrl?: string
  uploadingVideo: boolean
  videoUploadProgress: number
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveVideo: () => void
}

const VideoUploadSection = ({
  videoFile,
  currentVideoUrl,
  uploadingVideo,
  videoUploadProgress,
  onVideoUpload,
  onRemoveVideo
}: VideoUploadSectionProps) => {
  const isHLSUrl = (url: string): boolean => {
    return url.endsWith('.m3u8')
  }

  return (
    <Grid item xs={12} sm={6}>
      <Box>
        <Typography variant='body2' gutterBottom>
          Movie Video {currentVideoUrl && '(Current video will be replaced)'}
        </Typography>
        {videoFile ? (
          <Box>
            <Alert severity='info' sx={{ mb: 2 }}>
              New video selected: {videoFile.name}
            </Alert>
            <Button
              variant='outlined'
              size='small'
              color='error'
              startIcon={<i className='ri-delete-bin-line' />}
              onClick={onRemoveVideo}
            >
              Remove New Video
            </Button>
          </Box>
        ) : currentVideoUrl ? (
          <Box>
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
              {isHLSUrl(currentVideoUrl) ? (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  <HLSVideoPlayer src={getS3Url(currentVideoUrl)} controls />
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
                  <source src={getS3Url(currentVideoUrl)} type='video/mp4' />
                </video>
              )}
            </Box>
            <Button variant='outlined' component='label' fullWidth>
              <i className='ri-upload-2-line' />
              <span style={{ marginLeft: '8px' }}>Replace Video</span>
              <input
                type='file'
                hidden
                accept='.mp4, .mov, .avi, .mkv, .webm, video/mp4, video/quicktime, video/x-msvideo, video/x-matroska, video/webm'
                onChange={onVideoUpload}
              />
            </Button>
          </Box>
        ) : (
          <Button variant='outlined' component='label' fullWidth>
            <i className='ri-upload-2-line' />
            <span style={{ marginLeft: '8px' }}>Upload Video</span>
            <input type='file' hidden accept='video/*' onChange={onVideoUpload} />
          </Button>
        )}
        {uploadingVideo && (
          <Box mt={2}>
            <Typography variant='caption' color='text.secondary'>
              Uploading: {videoUploadProgress}%
            </Typography>
            <Box sx={{ width: '100%', mt: 1 }}>
              <Box
                sx={{
                  width: `${videoUploadProgress}%`,
                  height: '4px',
                  backgroundColor: 'primary.main',
                  borderRadius: '2px',
                  transition: 'width 0.3s'
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Grid>
  )
}

export default VideoUploadSection
