'use client'

// React Imports
import { useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import { Box, Typography, Stepper, Step, StepLabel, Button, Card, CardContent, CircularProgress } from '@mui/material'

// Components Imports
import TVSeriesMetadataForm from '@/components/tvseries/TVSeriesMetadataForm'
import SeasonManagement from '@/components/tvseries/SeasonManagement'
import TVSeriesReview from '@/components/tvseries/TVSeriesReview'

// API Imports
import { tvSeriesControllerCreateTvSeries } from '@/api/tvSeries'
import { actorsControllerGetActorById } from '@/api/actors'
import { directorsControllerGetDirectorById } from '@/api/directors'
import { TVSeriesWorkflowProvider, useTVSeriesWorkflow } from '@/features/tvseries/contexts/TVSeriesWorkflowContext'

const steps = ['Series Metadata', 'Seasons & Episodes', 'Review & Publish']

const UploadTVSeriesPageContent = () => {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const {
    activeStep,
    metadata,
    seasons,
    publishError,
    setMetadata,
    setSeasons,
    setPublishError,
    nextStep,
    prevStep,
    resetWorkflow
  } = useTVSeriesWorkflow()

  const handleMetadataComplete = (metadataData: any) => {
    setMetadata(metadataData)
    nextStep()
  }

  const handleSeasonsComplete = (seasonsData: API.CreateSeasonDto[]) => {
    setSeasons(seasonsData)
    nextStep()
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    setPublishError(null)

    try {
      // Fetch full actor data
      const actorPromises = metadata.actors.map((a: any) => actorsControllerGetActorById(a.id))
      const actorResponses = await Promise.all(actorPromises)

      const fullActors = actorResponses.map((res: any) => {
        const actor = res.data.data

        return {
          id: actor.id,
          name: actor.name,
          dateOfBirth: actor.dateOfBirth || '1/1/2025',
          gender: actor.gender || 'OTHER',
          bio: actor.bio || '',
          profilePicture: actor.profilePicture || '',
          nationality: actor.nationality || ''
        }
      })

      // Fetch full director data
      const directorPromises = metadata.directors.map((d: any) => directorsControllerGetDirectorById(d.id))
      const directorResponses = await Promise.all(directorPromises)

      const fullDirectors = directorResponses.map((res: any) => {
        const director = res.data.data

        return {
          id: director.id,
          name: director.name,
          dateOfBirth: director.dateOfBirth || '1/1/2025',
          gender: director.gender || 'OTHER',
          bio: director.bio || '',
          profilePicture: director.profilePicture || '',
          nationality: director.nationality || ''
        }
      })

      // Prepare seasons data - already in correct format from SeasonManagement
      const seasonsData = seasons

      //in ra video de debug

      // Create TV series with all data in one API call
      const tvSeriesData: API.CreateTVSeriesDto = {
        metaData: {
          type: 'TVSERIES',
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
        } as API.CreateContentDto,
        seasons: seasonsData
      }

      // Single API call to create TV series with all data
      await tvSeriesControllerCreateTvSeries(tvSeriesData)

      // Success - move to next step
      nextStep()
    } catch (error: any) {
      console.error('Error publishing TV series:', error)
      setPublishError(error.message || 'Failed to publish TV series. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <TVSeriesMetadataForm initialData={metadata} onComplete={handleMetadataComplete} />
      case 1:
        return (
          <SeasonManagement
            seriesMetadata={metadata}
            initialSeasons={seasons}
            onComplete={handleSeasonsComplete}
            onBack={prevStep}
          />
        )
      case 2:
        return <TVSeriesReview metadata={metadata} seasons={seasons} publishError={publishError} />
      default:
        return 'Unknown step'
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Upload TV Series
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Create and configure new TV series content with multiple seasons and episodes
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
              <i className='ri-check-double-line' style={{ fontSize: '64px', color: '#4caf50' }} />
            </Box>
            <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
              TV Series Published Successfully!
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
              Your TV series &quot;{metadata?.title}&quot; with {seasons.length} season(s) and{' '}
              {seasons.reduce((total, season) => total + season.episodes.length, 0)} episode(s) has been uploaded and is
              now available on the platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant='outlined' onClick={resetWorkflow}>
                Upload Another Series
              </Button>
              <Button variant='contained' onClick={() => router.push('/content/tvseries')}>
                View TV Series Library
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>{getStepContent(activeStep)}</Box>

          {/* Navigation Buttons - Only show for review step */}
          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button disabled={isPublishing} onClick={prevStep} startIcon={<i className='ri-arrow-left-line' />}>
                    Back to Edit
                  </Button>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={handlePublish}
                    disabled={isPublishing || seasons.length === 0}
                    startIcon={
                      isPublishing ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : (
                        <i className='ri-upload-cloud-line' />
                      )
                    }
                  >
                    {isPublishing ? 'Publishing...' : 'Publish TV Series'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  )
}

const UploadTVSeriesPage = () => {
  return (
    <TVSeriesWorkflowProvider>
      <UploadTVSeriesPageContent />
    </TVSeriesWorkflowProvider>
  )
}

export default UploadTVSeriesPage
