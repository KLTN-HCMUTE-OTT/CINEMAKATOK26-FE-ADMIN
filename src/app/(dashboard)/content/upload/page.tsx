'use client'

// React Imports
import { useState } from 'react'

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
  CircularProgress
} from '@mui/material'

// Components Imports
import VideoUploader from '@components/shared/VideoUploader'

// API Imports
import { moviesControllerCreateMovie } from '@/api/movies'
import { contentsControllerCreateContent } from '@/api/contents'
import { actorsControllerGetActorById } from '@/api/actors'
import { directorsControllerGetDirectorById } from '@/api/directors'

const steps = ['Upload Videos', 'Configure Metadata', 'Review & Publish']

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

  const handleUpload = (files: any[], fileMetadata: any) => {
    setUploadedFiles(files)
    setMetadata(fileMetadata)
    handleNext()
  }

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

  const getStepContent = (step: number) => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Review Metadata
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Content Type:
                  </Typography>
                  <Typography variant='body1'>{metadata?.type || 'Not specified'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Title:
                  </Typography>
                  <Typography variant='body1'>{metadata?.title || 'No title provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Description:
                  </Typography>
                  <Typography variant='body1'>{metadata?.description || 'No description provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Release Date:
                  </Typography>
                  <Typography variant='body1'>{metadata?.releaseDate || 'Not specified'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Maturity Rating:
                  </Typography>
                  <Typography variant='body1'>{metadata?.maturityRating}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    IMDb Rating:
                  </Typography>
                  <Typography variant='body1'>{metadata?.imdbRating || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Average Rating:
                  </Typography>
                  <Typography variant='body1'>{metadata?.avgRating || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Thumbnail:
                  </Typography>
                  <Typography variant='body1'>{metadata?.thumbnail || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Banner:
                  </Typography>
                  <Typography variant='body1'>{metadata?.banner || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Trailer:
                  </Typography>
                  <Typography variant='body1'>{metadata?.trailer || 'Not provided'}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Categories:
                  </Typography>
                  <Typography variant='body1'>
                    {metadata?.categories?.length > 0
                      ? metadata.categories.map((c: any) => c.categoryName).join(', ')
                      : 'No categories'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Tags:
                  </Typography>
                  <Typography variant='body1'>
                    {metadata?.tags?.length > 0 ? metadata.tags.map((t: any) => t.tagName).join(', ') : 'No tags'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Actors:
                  </Typography>
                  <Typography variant='body1'>
                    {metadata?.actors?.length > 0 ? metadata.actors.map((a: any) => a.name).join(', ') : 'No actors'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Directors:
                  </Typography>
                  <Typography variant='body1'>
                    {metadata?.directors?.length > 0
                      ? metadata.directors.map((d: any) => d.name).join(', ')
                      : 'No directors'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    Uploaded Files:
                  </Typography>
                  <Typography variant='body1'>{uploadedFiles.length} file(s)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3 }}>
                Ready to Publish
              </Typography>
              {publishError && (
                <Alert severity='error' sx={{ mb: 3 }}>
                  {publishError}
                </Alert>
              )}
              {!publishError && (
                <Alert severity='success' sx={{ mb: 3 }}>
                  All files have been processed and are ready for publishing!
                </Alert>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant='body1'>
                  Your content will be published with the following configuration:
                </Typography>
                <ul>
                  <li>Type: {metadata?.type}</li>
                  <li>Title: {metadata?.title}</li>
                  <li>Release Date: {metadata?.releaseDate}</li>
                  <li>Maturity Rating: {metadata?.maturityRating}</li>
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
      default:
        return 'Unknown step'
    }
  }

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
          {/* VideoUploader — always mounted to preserve file/metadata state across steps */}
          <Box sx={{ mb: 4, display: activeStep === 0 ? 'block' : 'none' }}>
            <VideoUploader
              key={uploaderKey}
              onUpload={handleUpload}
              maxFileSize={5000}
              acceptedFormats={['.mp4', '.mov', '.avi', '.mkv', '.webm']}
            />
          </Box>
          {/* Step content for steps 1+ */}
          {activeStep > 0 && <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>}

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
