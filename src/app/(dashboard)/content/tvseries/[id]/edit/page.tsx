'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Box,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'

import { tvSeriesControllerGetTvSeriesById, tvSeriesControllerUpdateTvSeries } from '@/api/tvSeries'
import SeasonManagement from '@/components/tvseries/SeasonManagement'
import { actorsControllerGetActorById } from '@/api/actors'
import { directorsControllerGetDirectorById } from '@/api/directors'
import TVSeriesMetadataForm from '@/components/tvseries/TVSeriesMetadataForm'
import TVSeriesReview from '@/components/tvseries/TVSeriesReview'

const steps = ['Series Metadata', 'Seasons & Episodes', 'Review & Update']

const EditTVSeriesPage = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [originalTVSeries, setOriginalTVSeries] = useState<API.TVSeriesDto | null>(null)

  const [metadata, setMetadata] = useState<any>(null)
  const [seasons, setSeasons] = useState<API.CreateSeasonDto[]>([])

  const [seasonIdMap, setSeasonIdMap] = useState<Map<number, string>>(new Map())
  const [episodeIdMap, setEpisodeIdMap] = useState<Map<string, string>>(new Map())

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    fetchTVSeriesData()
  }, [id])

  const fetchTVSeriesData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await tvSeriesControllerGetTvSeriesById({ id })
      const tvSeries = response.data.data

      setOriginalTVSeries(tvSeries)

      const transformedMetadata = {
        id: tvSeries.metaData.id,
        title: tvSeries.metaData.title,
        description: tvSeries.metaData.description,
        releaseDate: tvSeries.metaData.releaseDate,
        maturityRating: tvSeries.metaData.maturityRating,
        thumbnail: tvSeries.metaData.thumbnail,
        viewCount: tvSeries.metaData.viewCount,
        banner: tvSeries.metaData.banner,
        trailer: tvSeries.metaData.trailer,
        imdbRating: tvSeries.metaData.imdbRating,
        avgRating: tvSeries.metaData.avgRating,
        categories: tvSeries.metaData.categories,
        tags: tvSeries.metaData.tags,
        actors: tvSeries.metaData.actors,
        directors: tvSeries.metaData.directors
      }

      setMetadata(transformedMetadata)

      const seasonMap = new Map<number, string>()
      const episodeMap = new Map<string, string>()

      tvSeries.seasons.forEach(season => {
        seasonMap.set(season.seasonNumber, season.id)

        season.episodes.forEach(episode => {
          const key = `${season.seasonNumber}-${episode.episodeNumber}`

          episodeMap.set(key, episode.id)
        })
      })

      setSeasonIdMap(seasonMap)
      setEpisodeIdMap(episodeMap)

      const transformedSeasons: API.CreateSeasonDto[] = tvSeries.seasons.map(season => ({
        seasonNumber: season.seasonNumber,
        episodes: season.episodes.map(episode => ({
          episodeNumber: episode.episodeNumber,
          episodeTitle: episode.episodeTitle,
          episodeDuration: episode.episodeDuration,
          video: {
            id: episode.video.id,
            videoUrl: episode.video.videoUrl,
            status: episode.video.status,
            thumbnailUrl: episode.video.thumbnailUrl,
            sprites: episode.video.sprites,
            vttFiles: episode.video.vttFiles
          }
        }))
      }))

      setSeasons(transformedSeasons)
    } catch (err: any) {
      console.error('Error fetching TV series:', err)
      setError(err.message || 'Failed to load TV series data')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    router.push(`/content/tvseries/${id}`)
  }

  const handleMetadataComplete = (metadataData: any) => {
    setMetadata(metadataData)
    handleNext()
  }

  const handleSeasonsComplete = (seasonsData: API.CreateSeasonDto[]) => {
    setSeasons(seasonsData)
    handleNext()
  }

  const handleUpdate = async () => {
    setIsUpdating(true)
    setUpdateError(null)

    if (!metadata) {
      setUpdateError('Metadata is missing. Please complete the previous steps.')
      setIsUpdating(false)

      return
    }

    try {
      // Fetch full actor data
      const actorPromises = (metadata.actors || [])
        .filter((actor: any) => actor?.id)
        .map((actor: any) => actorsControllerGetActorById({ id: actor.id }))

      const actorResponses = await Promise.all(actorPromises)

      // Filter to only include allowed fields for actors
      const fullActors = actorResponses.map((res: any) => {
        const actor = res.data.data

        // Explicitly return only allowed fields
        return {
          id: actor.id,
          name: actor.name,
          profilePicture: actor.profilePicture || null,
          bio: actor.bio || null,
          nationality: actor.nationality || null,
          dateOfBirth: actor.dateOfBirth || null,
          gender: actor.gender || null
        }
      })

      // Fetch full director data
      const directorPromises = (metadata.directors || [])
        .filter((director: any) => director?.id)
        .map((director: any) => directorsControllerGetDirectorById({ id: director.id }))

      const directorResponses = await Promise.all(directorPromises)

      // Filter to only include allowed fields for directors
      const fullDirectors = directorResponses.map((res: any) => {
        const director = res.data.data

        //Explicitly return only allowed fields
        return {
          id: director.id,
          name: director.name,
          profilePicture: director.profilePicture || null,
          bio: director.bio || null,
          nationality: director.nationality || null,
          dateOfBirth: director.dateOfBirth || null,
          gender: director.gender || null
        }
      })

      // Convert CreateSeasonDto[] to UpdateSeasonDto[]
      const updateSeasons: API.UpdateSeasonDto[] = seasons.map(season => {
        const seasonId = seasonIdMap.get(season.seasonNumber)

        return {
          id: seasonId!,
          seasonNumber: season.seasonNumber,
          episodes: season.episodes.map(episode => {
            const key = `${season.seasonNumber}-${episode.episodeNumber}`
            const episodeId = episodeIdMap.get(key)

            return {
              id: episodeId!,
              episodeNumber: episode.episodeNumber,
              episodeTitle: episode.episodeTitle,
              episodeDuration: episode.episodeDuration,
              video: episode.video!
            }
          })
        }
      })

      const updateData: API.UpdateTVSeriesDto = {
        metaData: {
          id: originalTVSeries?.metaData.id || metadata.id, // ✅ Fallback to originalTVSeries
          type: 'TVSERIES',
          title: metadata.title || '',
          description: metadata.description || '',
          releaseDate: metadata.releaseDate || '',
          maturityRating: metadata.maturityRating || '',
          thumbnail: metadata.thumbnail || '',
          banner: metadata.banner || '',
          viewCount: metadata.viewCount || 0,
          trailer: metadata.trailer || null,
          imdbRating: Number(metadata.imdbRating) || 0,
          avgRating: Number(metadata.avgRating) || 0,
          categories: (metadata.categories || [])
            .filter((cat: any) => cat?.id && cat?.categoryName)
            .map((cat: any) => ({
              id: cat.id,
              categoryName: cat.categoryName
            })),
          tags: (metadata.tags || [])
            .filter((tag: any) => tag?.id && tag?.tagName)
            .map((tag: any) => ({
              id: tag.id,
              tagName: tag.tagName
            })),
          actors: fullActors,
          directors: fullDirectors
        },
        seasons: updateSeasons
      }

      await tvSeriesControllerUpdateTvSeries({ id }, updateData)

      handleNext()
    } catch (error: any) {
      console.error('Error updating TV series:', error)
      console.error('Error details:', error.response?.data || error.message)
      setUpdateError(
        error?.response?.data?.message || error?.message || 'Failed to update TV series. Please try again.'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const getStepContent = (step: number) => {
    if (!metadata || !seasons) return null

    switch (step) {
      case 0:
        return <TVSeriesMetadataForm initialData={metadata} onComplete={handleMetadataComplete} />

      case 1:
        return (
          <SeasonManagement
            seriesMetadata={metadata}
            initialSeasons={seasons}
            onComplete={handleSeasonsComplete}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <Box>
            <TVSeriesReview metadata={metadata} seasons={seasons} publishError={updateError} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack} disabled={isUpdating}>
                Back
              </Button>
              <Button variant='contained' onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update TV Series'}
              </Button>
            </Box>

            {updateError && (
              <Alert severity='error' sx={{ mt: 2 }}>
                {updateError}
              </Alert>
            )}
          </Box>
        )

      default:
        return 'Unknown step'
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !originalTVSeries) {
    return (
      <Box>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error || 'TV series not found'}
        </Alert>
        <Button variant='contained' onClick={() => router.push('/content/tvseries')}>
          Back to TV Series List
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Edit TV Series
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Update {originalTVSeries.metaData.title} information
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
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
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='h5' gutterBottom color='success.main'>
                ✓ TV Series Updated Successfully!
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
                {originalTVSeries.metaData.title} has been updated with {seasons.length} season(s).
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant='outlined' onClick={() => router.push('/content/tvseries')}>
                  Back to TV Series List
                </Button>
                <Button variant='contained' onClick={() => router.push(`/content/tvseries/${id}`)}>
                  View TV Series
                </Button>
                <Button variant='outlined' onClick={handleReset}>
                  Edit Again
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>{getStepContent(activeStep)}</CardContent>
        </Card>
      )}
    </Box>
  )
}

export default EditTVSeriesPage
