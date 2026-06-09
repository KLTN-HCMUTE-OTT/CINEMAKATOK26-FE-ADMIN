'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid, TextField, Button, Box, Typography, CircularProgress, LinearProgress, Alert, Chip } from '@mui/material'

// Hooks
import { useVideoUpload } from '@/hooks/useVideoUpload'

interface EpisodeFormProps {
  episode: {
    episodeNumber: number
    episodeTitle: string
    episodeDuration: number // in minutes
    video?: API.UpdateVideoDto | null
  }
  onSave: (data: { episodeTitle: string; episodeDuration: number; video: API.UpdateVideoDto }) => void
  onCancel: () => void
}

const EpisodeForm = ({ episode, onSave, onCancel }: EpisodeFormProps) => {
  const [episodeTitle, setEpisodeTitle] = useState(episode.episodeTitle)
  const [episodeDuration, setEpisodeDuration] = useState(episode.episodeDuration)
  const [video, setVideo] = useState<API.UpdateVideoDto | null>(episode.video || null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoError, setVideoError] = useState<string | null>(null)

  const { extractVideoDuration, uploadVideoToAPI } = useVideoUpload()

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    setUploadingVideo(true)
    setVideoError(null)
    setVideoProgress(0)

    try {
      // Extract duration
      const videoDuration = await extractVideoDuration(file)

      setEpisodeDuration(videoDuration.minutes) // Store in minutes

      // Create VideoFile object for upload
      const videoFile = {
        id: `temp-${Date.now()}`,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading' as const,
        file
      }

      // Upload video with progress
      const uploadedVideo = await uploadVideoToAPI(videoFile, (progressStr: string) => {
        const progressNum = parseInt(progressStr, 10)

        setVideoProgress(progressNum)
      })

      if (uploadedVideo) {
        // Store the full video data
        const videoData: API.UpdateVideoDto = {
          id: uploadedVideo.id,
          thumbnailUrl: uploadedVideo.thumbnailUrl,
          videoUrl: uploadedVideo.videoUrl,
          status: uploadedVideo.status
        } as any

        setVideo(videoData)
      }
    } catch (error: any) {
      console.error('Error uploading video:', error)
      setVideoError(error.message || 'Failed to upload video')
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleSubmit = () => {
    if (!episodeTitle.trim()) {
      alert('Please enter episode title')

      return
    }

    if (!video) {
      alert('Please upload episode video')

      return
    }

    onSave({
      episodeTitle,
      episodeDuration,
      video
    })
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Episode Title */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label='Episode Title'
            placeholder={`Episode ${episode.episodeNumber} title`}
            value={episodeTitle}
            onChange={e => setEpisodeTitle(e.target.value)}
          />
        </Grid>

        {/* Duration (read-only, auto-extracted) */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Duration (minutes)'
            value={episodeDuration > 0 ? episodeDuration : 0}
            InputProps={{
              readOnly: true,
              endAdornment: episodeDuration > 0 && <Chip label='Auto-detected' size='small' color='success' />
            }}
          />
        </Grid>

        {/* Video Upload */}
        <Grid item xs={12}>
          <Box>
            <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
              Episode Video * {video?.videoUrl && <Chip label='Uploaded' size='small' color='success' sx={{ ml: 1 }} />}
            </Typography>

            <Button
              variant='outlined'
              component='label'
              fullWidth
              disabled={uploadingVideo}
              startIcon={uploadingVideo ? <CircularProgress size={20} /> : <i className='ri-video-upload-line' />}
            >
              {uploadingVideo ? `Uploading... ${videoProgress}%` : video ? 'Change Video' : 'Upload Video'}
              <input type='file' hidden accept='video/*' onChange={handleVideoUpload} />
            </Button>

            {uploadingVideo && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant='determinate' value={videoProgress} />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  {videoProgress < 50 ? 'Uploading...' : videoProgress < 100 ? 'Processing...' : 'Finalizing...'}
                </Typography>
              </Box>
            )}

            {videoError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                {videoError}
              </Alert>
            )}
          </Box>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button onClick={onCancel} disabled={uploadingVideo}>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleSubmit} disabled={uploadingVideo || !video}>
              Save Episode
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EpisodeForm
