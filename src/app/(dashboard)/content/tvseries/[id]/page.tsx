'use client'

import { useState, useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'

import { tvSeriesControllerGetTvSeriesById, tvSeriesControllerDeleteTvSeries } from '@/api/tvSeries'
import { DialogTrailer } from '@/components/movies/DialogTrailer'
import { DialogVideo } from '@/components/movies/DialogVideo' // ✅ Import DialogVideo
import { ContentDirectors } from '@/components/content/ContentDirectors'
import { ContentCast } from '@/components/content/ContentCast'
import { ContentCategories } from '@/components/content/ContentCategories'
import { ContentTags } from '@/components/content/ContentTags'
import { ContentInfo } from '@/components/content/ContentInfo'

const TVSeriesDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [tvSeries, setTVSeries] = useState<API.TVSeriesDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null)
  const [trailerDialogOpen, setTrailerDialogOpen] = useState(false)

  // ✅ State cho episode video dialog
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  const [selectedEpisode, setSelectedEpisode] = useState<{
    title: string
    video: API.VideoDto
    thumbnailUrl: string
  } | null>(null)

  useEffect(() => {
    fetchTVSeriesDetail()
  }, [id])

  const fetchTVSeriesDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await tvSeriesControllerGetTvSeriesById({ id })

      setTVSeries(response.data.data)
    } catch (err: any) {
      console.error('Error fetching TV series:', err)
      setError(err.message || 'Failed to load TV series details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this TV series? This action cannot be undone.')) {
      return
    }

    try {
      await tvSeriesControllerDeleteTvSeries({ id })
      router.push('/content/tvseries')
    } catch (err: any) {
      console.error('Error deleting TV series:', err)
      alert(err.message || 'Failed to delete TV series')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/content/tvseries/${id}/edit`)
  }

  const getTotalEpisodes = () => {
    if (!tvSeries) return 0

    return tvSeries.seasons.reduce((total, season) => total + season.episodes.length, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !tvSeries) {
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

  const metadata = tvSeries.metaData

  // ✅ Handler để mở video dialog
  const handlePlayEpisode = (episode: any, seasonNumber: number) => {
    setSelectedEpisode({
      title: `Season ${seasonNumber}, Episode ${episode.episodeNumber}: ${episode.episodeTitle}`,
      video: episode.video,
      thumbnailUrl: episode.video.thumbnailUrl
    })
    setVideoDialogOpen(true)
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
            {metadata.title}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            TV Series Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' onClick={() => router.push('/content/tvseries')}>
            Back to List
          </Button>
          <Button variant='outlined' color='primary' onClick={handleEdit}>
            Edit
          </Button>
          <Button variant='outlined' color='error' onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </Box>

      {/* Banner Image */}
      {metadata.banner && (
        <Card sx={{ mb: 3 }}>
          <Box
            component='img'
            src={metadata.banner}
            alt={metadata.title}
            sx={{
              width: '100%',
              height: 400,
              objectFit: 'cover'
            }}
          />
        </Card>
      )}

      {/* Main Info */}
      <Grid container spacing={3}>
        {/* Left Column - Thumbnail & Quick Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              {metadata.thumbnail && (
                <Box
                  component='img'
                  src={metadata.thumbnail}
                  alt={metadata.title}
                  sx={{
                    width: '100%',
                    borderRadius: 1,
                    mb: 2
                  }}
                />
              )}

              <Stack spacing={2}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Type
                  </Typography>
                  <Typography variant='body1'>{metadata.type}</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Release Date
                  </Typography>
                  <Typography variant='body1'>{formatDate(metadata.releaseDate)}</Typography>
                </Box>

                {/* Trailer */}
                {metadata.trailer && (
                  <Box>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography variant='caption' color='text.secondary'>
                        Trailer
                      </Typography>
                      <Box>
                        <Button variant='text' onClick={() => setTrailerDialogOpen(true)}>
                          Watch Trailer
                        </Button>
                      </Box>
                    </div>
                  </Box>
                )}

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Maturity Rating
                  </Typography>
                  <Chip label={metadata.maturityRating} size='small' color='primary' />
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Access Tier
                  </Typography>
                  <Chip
                    label={metadata.accessTier || 'BASIC'}
                    size='small'
                    color={metadata.accessTier === 'PREMIUM' ? 'secondary' : 'default'}
                  />
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    IMDB Rating
                  </Typography>
                  <Typography variant='body1'>⭐ {metadata.imdbRating}/10</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Average Rating
                  </Typography>
                  <Typography variant='body1'>⭐ {metadata.avgRating}/5</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Total Seasons
                  </Typography>
                  <Typography variant='body1'>{tvSeries.seasons.length} seasons</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Total Episodes
                  </Typography>
                  <Typography variant='body1'>{getTotalEpisodes()} episodes</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          {/* Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <ContentInfo title={metadata.title} type={metadata.type} description={metadata.description} />
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <ContentCategories categories={metadata.categories} />
              <ContentTags tags={metadata.tags} />
            </CardContent>
          </Card>
          {/* Actors */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <ContentCast actors={metadata.actors} />
            </CardContent>
          </Card>

          {/* Directors */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <ContentDirectors directors={metadata.directors} />
            </CardContent>
          </Card>

          {/* Seasons & Episodes */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                Seasons & Episodes ({tvSeries.seasons.length} seasons, {getTotalEpisodes()} episodes)
              </Typography>

              {tvSeries.seasons.map(season => (
                <Accordion
                  key={season.id}
                  expanded={expandedSeason === season.seasonNumber}
                  onChange={() =>
                    setExpandedSeason(expandedSeason === season.seasonNumber ? null : season.seasonNumber)
                  }
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography variant='body1' fontWeight={600}>
                        Season {season.seasonNumber}
                      </Typography>
                      <Chip label={`${season.episodes.length} episodes`} size='small' />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {season.episodes.map(episode => (
                        <Card key={episode.id} variant='outlined'>
                          <CardContent>
                            <Grid container spacing={2} alignItems='center'>
                              {/* Episode Thumbnail */}
                              <Grid item xs={12} sm={3}>
                                <Box
                                  component='img'
                                  src={episode.video?.thumbnailUrl || ''}
                                  alt={episode.episodeTitle}
                                  sx={{
                                    width: '100%',
                                    borderRadius: 1,
                                    aspectRatio: '16/9',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Grid>

                              {/* Episode Info */}
                              <Grid item xs={12} sm={6}>
                                <Typography variant='body1' fontWeight={600} sx={{ mb: 0.5 }}>
                                  Episode {episode.episodeNumber}: {episode.episodeTitle}
                                </Typography>
                                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                                  Duration: {formatDuration(episode.episodeDuration)}
                                </Typography>
                                <Chip
                                  label={episode.video?.status}
                                  size='small'
                                  color={episode.video?.status === 'READY' ? 'success' : 'warning'}
                                />
                              </Grid>

                              {/* Actions */}
                              <Grid item xs={12} sm={3} sx={{ textAlign: 'right' }}>
                                {episode.video && (
                                  <Tooltip title='Watch Episode'>
                                    {/* ✅ Thay đổi onClick để mở dialog */}
                                    <IconButton
                                      color='primary'
                                      onClick={() => handlePlayEpisode(episode, season.seasonNumber)}
                                    >
                                      <i className='ri-play-circle-line' />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          {/* ✅ Trailer Dialog */}
          <DialogTrailer
            title={tvSeries.metaData?.title}
            trailerUrl={tvSeries.metaData?.trailer}
            trailerDialogOpen={trailerDialogOpen}
            setTrailerDialogOpen={setTrailerDialogOpen}
          />

          {/* ✅ Episode Video Dialog */}
          {selectedEpisode && (
            <DialogVideo
              title={selectedEpisode.title}
              video={selectedEpisode.video}
              thumbnailUrl={selectedEpisode.thumbnailUrl}
              videoDialogOpen={videoDialogOpen}
              setVideoDialogOpen={setVideoDialogOpen}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default TVSeriesDetailPage
