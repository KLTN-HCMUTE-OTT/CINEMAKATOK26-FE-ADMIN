'use client'

// React Imports
import { useState, useCallback } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material'

// Components Imports
import VideoUploader from '@components/shared/VideoUploader'

// API Imports
import { moviesControllerCreateMovie } from '@/api/movies'
import { contentsControllerCreateContent } from '@/api/contents'
import { actorsControllerGetActorById } from '@/api/actors'
import { directorsControllerGetDirectorById } from '@/api/directors'

const steps = ['Upload and Configure', 'Review Metadata', 'Publish']

const UploadPage = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [metadata, setMetadata] = useState<any>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [uploaderKey, setUploaderKey] = useState(0)

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setUploadedFiles([])
    setMetadata(null)
    setPublishError(null)
    setUploaderKey(k => k + 1)
  }

  // Only advance to the next step when coming from step 0 (prevent double-advance on back-navigation)
  const handleUpload = (files: any[], fileMetadata: any) => {
    setUploadedFiles(files)
    setMetadata(fileMetadata)
    setActiveStep(prev => (prev === 0 ? 1 : prev))
  }

  // Sync state changes in real-time from the uploader component
  const handleUploaderChange = useCallback((files: any[], fileMetadata: any) => {
    setUploadedFiles(files)
    setMetadata(fileMetadata)
  }, [])

  const handlePublish = async () => {
    setIsPublishing(true)
    setPublishError(null)

    try {
      // Fetch full actor data
      const actorPromises = metadata.actors.map((a: any) => actorsControllerGetActorById({ id: a.id }))
      const actorResponses = await Promise.all(actorPromises)

      const fullActors = actorResponses.map(res => {
        const actor = res.data.data

        console.log('Fetched actor data:', actor)

        // Remove createdAt, updatedAt and fill in default values
        const { createdAt, updatedAt, contentCount, contents, ...actorWithoutTimestamps } = actor

        return {
          ...actorWithoutTimestamps,
          dateOfBirth: actor.dateOfBirth || '1/1/2025',
          gender: actor.gender || 'OTHER',
          bio: actor.bio || '',
          profilePicture: actor.profilePicture || '',
          nationality: actor.nationality || ''
        }
      })

      // Fetch full director data
      const directorPromises = metadata.directors.map((d: any) => directorsControllerGetDirectorById({ id: d.id }))
      const directorResponses = await Promise.all(directorPromises)

      const fullDirectors = directorResponses.map(res => {
        const director = res.data.data

        // Remove createdAt, updatedAt and fill in default values
        const { createdAt, updatedAt, contentCount, contents, ...directorWithoutTimestamps } = director

        return {
          ...directorWithoutTimestamps,
          dateOfBirth: director.dateOfBirth || '1/1/2025',
          gender: director.gender || 'OTHER',
          bio: director.bio || '',
          profilePicture: director.profilePicture || '',
          nationality: director.nationality || ''
        }
      })

      // Create content metadata with full actor and director data
      const contentData: API.CreateContentDto = {
        type: metadata.type,
        title: metadata.title,
        description: metadata.description,
        releaseDate: metadata.releaseDate,
        maturityRating: metadata.maturityRating,
        accessTier: metadata.accessTier || 'BASIC',
        thumbnail: metadata.thumbnail,
        banner: metadata.banner,
        trailer: metadata.trailer,
        imdbRating: metadata.imdbRating || 0,
        avgRating: metadata.avgRating || 0,
        categories: metadata.categories.map((c: any) => ({ id: c.id, categoryName: c.categoryName })),
        tags: metadata.tags.map((t: any) => ({ id: t.id, tagName: t.tagName })),
        actors: fullActors,
        directors: fullDirectors
      }

      // Create content first
      const contentResponse = await contentsControllerCreateContent(contentData)

      if (metadata.type === 'MOVIE') {
        // Calculate duration from uploaded video file (in minutes)
        const videoDuration = uploadedFiles[0]?.durationInMinutes || 120 // Default to 120 if not available

        // Create movie with video data - Truyền toàn bộ videoData hoặc null
        const movieData: API.CreateMovieDto = {
          duration: videoDuration,
          metaData: contentResponse.data.data,
          video: uploadedFiles[0]?.videoData || null
        }

        await moviesControllerCreateMovie(movieData)
      }

      // Success - move to next step
      handleNext()
    } catch (error: any) {
      console.error('Error publishing content:', error)
      setPublishError(error.message || 'Failed to publish content. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  // Build review/publish JSX inline (no switch needed, VideoUploader is always mounted)
  const reviewContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Banner / Thumbnail preview */}
      {(metadata?.thumbnail || metadata?.banner) && (
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>Media Preview</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {metadata?.thumbnail && (
                <Box>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>Thumbnail</Typography>
                  <img
                    src={metadata.thumbnail}
                    alt='Thumbnail'
                    style={{ height: 120, borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd' }}
                  />
                </Box>
              )}
              {metadata?.banner && (
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>Banner</Typography>
                  <img
                    src={metadata.banner}
                    alt='Banner'
                    style={{ width: '100%', maxHeight: 120, borderRadius: 6, objectFit: 'cover', border: '1px solid #ddd' }}
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Core info */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>Content Information</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant='caption' color='text.secondary'>Title</Typography>
              <Typography variant='body1' sx={{ fontWeight: 600 }}>{metadata?.title || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Content Type</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={metadata?.type || '—'} size='small' color='primary' variant='outlined' />
              </Box>
            </Box>
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Typography variant='caption' color='text.secondary'>Description</Typography>
              <Typography variant='body2' sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {metadata?.description || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Release Date</Typography>
              <Typography variant='body1'>
                {metadata?.releaseDate ? new Date(metadata.releaseDate).toLocaleDateString() : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Maturity Rating</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={metadata?.maturityRating || '—'} size='small' />
              </Box>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Access Tier</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={metadata?.accessTier || 'BASIC'}
                  size='small'
                  color={metadata?.accessTier === 'PREMIUM' ? 'secondary' : 'default'}
                  variant='outlined'
                />
              </Box>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>IMDb Rating</Typography>
              <Typography variant='body1'>{metadata?.imdbRating ?? 0} / 10</Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>Avg Rating</Typography>
              <Typography variant='body1'>{metadata?.avgRating ?? 0} / 10</Typography>
            </Box>
            {metadata?.trailer && (
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                <Typography variant='caption' color='text.secondary'>Trailer URL</Typography>
                <Typography variant='body2' sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                  <a href={metadata.trailer} target='_blank' rel='noreferrer'>{metadata.trailer}</a>
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Taxonomy */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>Categories, Tags and Cast</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>Categories</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {metadata?.categories?.length > 0
                  ? metadata.categories.map((c: any) => <Chip key={c.id} label={c.categoryName} size='small' />)
                  : <Typography variant='body2' color='text.secondary'>No categories</Typography>}
              </Box>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>Tags</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {metadata?.tags?.length > 0
                  ? metadata.tags.map((t: any) => <Chip key={t.id} label={t.tagName} size='small' variant='outlined' />)
                  : <Typography variant='body2' color='text.secondary'>No tags</Typography>}
              </Box>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>Actors</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {metadata?.actors?.length > 0
                  ? metadata.actors.map((a: any) => <Chip key={a.id} label={a.name} size='small' color='primary' variant='outlined' />)
                  : <Typography variant='body2' color='text.secondary'>No actors</Typography>}
              </Box>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>Directors</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {metadata?.directors?.length > 0
                  ? metadata.directors.map((d: any) => <Chip key={d.id} label={d.name} size='small' color='secondary' variant='outlined' />)
                  : <Typography variant='body2' color='text.secondary'>No directors</Typography>}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Uploaded files */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>Uploaded Video{uploadedFiles.length !== 1 ? 's' : ''}</Typography>
          {uploadedFiles.length === 0 ? (
            <Alert severity='warning'>No video files uploaded yet.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {uploadedFiles.map((f: any, idx: number) => (
                <Box key={f.id || idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <i className='ri-film-line' style={{ fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{f.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {f.duration ? `Duration: ${f.duration}` : ''}
                      {f.durationInMinutes ? ` (${f.durationInMinutes} min)` : ''}
                      {f.size ? ` · ${(f.size / (1024 * 1024)).toFixed(1)} MB` : ''}
                    </Typography>
                  </Box>
                  <Chip
                    label={f.videoData?.status || f.status || 'ready'}
                    size='small'
                    color={(f.videoData?.status || f.status) === 'READY' ? 'success' : (f.videoData?.status || f.status) === 'FAILED' ? 'error' : 'warning'}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )

  const publishContent = (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3 }}>Ready to Publish</Typography>
        {publishError && (
          <Alert severity='error' sx={{ mb: 3 }}>{publishError}</Alert>
        )}
        {!publishError && (
          <Alert severity='success' sx={{ mb: 3 }}>All files have been processed and are ready for publishing!</Alert>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant='body1'>Your content will be published with the following configuration:</Typography>
          <ul>
            <li>Type: {metadata?.type}</li>
            <li>Title: {metadata?.title}</li>
            <li>Release Date: {metadata?.releaseDate}</li>
            <li>Maturity Rating: {metadata?.maturityRating}</li>
            <li>Access Tier: {metadata?.accessTier || 'BASIC'}</li>
            <li>Files: {uploadedFiles.length} video file(s)</li>
            <li>
              Categories:{' '}
              {metadata?.categories?.length > 0
                ? metadata.categories.map((c: any) => c.categoryName).join(', ')
                : 'None'}
            </li>
            <li>
              Tags: {metadata?.tags?.length > 0 ? metadata.tags.map((t: any) => t.tagName).join(', ') : 'None'}
            </li>
          </ul>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Upload Content
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Upload and configure new video content for your streaming platform
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      {activeStep === steps.length ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Box sx={{ mb: 3 }}>
              <i className='ri-check-double-line text-6xl text-green-500' />
            </Box>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Content Published Successfully!
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
              Your content has been uploaded and is now available on the platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button onClick={handleReset}>Upload More Content</Button>
              <Button variant='contained' href='/content/movies'>
                View Content Library
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          {/*
           * VideoUploader is ALWAYS mounted — never unmounted — so all form state
           * (text fields, Autocomplete selections, uploaded files) is preserved
           * naturally when the user navigates Back from the review step.
           * We simply hide it with display:none when on other steps.
           */}
          <Box sx={{ mb: 4, display: activeStep === 0 ? 'block' : 'none' }}>
            <VideoUploader
              onUpload={handleUpload}
              onChange={handleUploaderChange}
              maxFileSize={5000}
              acceptedFormats={['.mp4', '.mov', '.avi', '.mkv', '.webm']}
            />
          </Box>

          {/* Review Metadata (step 1) */}
          {activeStep === 1 && (
            <Box sx={{ mb: 4 }}>{reviewContent}</Box>
          )}

          {/* Publish (step 2) */}
          {activeStep === 2 && (
            <Box sx={{ mb: 4 }}>{publishContent}</Box>
          )}

          {/* Navigation Buttons */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant='contained'
                  onClick={activeStep === steps.length - 1 ? handlePublish : handleNext}
                  disabled={
                    (activeStep === 0 && uploadedFiles.length === 0) ||
                    (activeStep === 1 && !metadata?.title) ||
                    isPublishing
                  }
                  startIcon={isPublishing ? <CircularProgress size={20} color='inherit' /> : undefined}
                >
                  {isPublishing ? 'Publishing...' : activeStep === steps.length - 1 ? 'Publish' : 'Next'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default UploadPage
