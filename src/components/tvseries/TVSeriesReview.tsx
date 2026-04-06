'use client'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'

interface TVSeriesReviewProps {
  metadata: any
  seasons: API.CreateSeasonDto[]
  publishError: string | null
}

const TVSeriesReview = ({ metadata, seasons, publishError }: TVSeriesReviewProps) => {
  const getTotalEpisodes = () => {
    return seasons.reduce((total, season) => total + season.episodes.length, 0)
  }

  const getTotalDuration = () => {
    let totalMinutes = 0

    seasons.forEach(season => {
      season.episodes.forEach(episode => {
        totalMinutes += episode.episodeDuration
      })
    })

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return { hours, minutes, totalMinutes }
  }

  const duration = getTotalDuration()

  return (
    <Box>
      {/* Error Alert */}
      {publishError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            Failed to publish TV series
          </Typography>
          <Typography variant='body2'>{publishError}</Typography>
        </Alert>
      )}

      {/* Success Alert */}
      {!publishError && (
        <Alert severity='success' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            Your TV series is ready to publish! Review the details below and click &quot;Publish&quot; when you&apos;re
            ready.
          </Typography>
        </Alert>
      )}

      {/* Overview Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            Overview
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='primary' sx={{ fontWeight: 600 }}>
                  {seasons.length}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Seasons
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='primary' sx={{ fontWeight: 600 }}>
                  {getTotalEpisodes()}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Episodes
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h4' color='primary' sx={{ fontWeight: 600 }}>
                  {duration.hours}h {duration.minutes}m
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Duration
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={metadata.maturityRating}
                  color='primary'
                  sx={{ fontSize: '1.2rem', height: 'auto', py: 1 }}
                />
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Rating
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Series Metadata */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            Series Information
          </Typography>

          <Grid container spacing={3}>
            {/* Images Preview */}
            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Thumbnail
              </Typography>
              <Box
                component='img'
                src={metadata.thumbnail}
                alt='Thumbnail'
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  objectFit: 'cover'
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Banner
              </Typography>
              <Box
                component='img'
                src={metadata.banner}
                alt='Banner'
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  objectFit: 'cover'
                }}
              />
            </Grid>

            {/* Title & Description */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Title
              </Typography>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {metadata.title}
              </Typography>

              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Description
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {metadata.description}
              </Typography>
            </Grid>

            {/* Release Date */}
            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Release Date
              </Typography>
              <Typography variant='body1'>
                {new Date(metadata.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Grid>

            {/* Ratings */}
            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Ratings
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip label={`IMDB: ${metadata.imdbRating}`} />
                <Chip label={`Avg: ${metadata.avgRating}`} />
              </Box>
            </Grid>

            {/* Categories */}
            {metadata.categories.length > 0 && (
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {metadata.categories.map((cat: any) => (
                    <Chip key={cat.id} label={cat.categoryName} color='primary' variant='outlined' />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Tags */}
            {metadata.tags.length > 0 && (
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {metadata.tags.map((tag: any) => (
                    <Chip key={tag.id} label={tag.tagName} size='small' />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Cast */}
            {metadata.actors.length > 0 && (
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Cast
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {metadata.actors.map((actor: any) => (
                    <Chip
                      key={actor.id}
                      avatar={<Avatar src={actor.profilePicture}>{actor.name[0]}</Avatar>}
                      label={actor.name}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Directors */}
            {metadata.directors.length > 0 && (
              <Grid item xs={12}>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                  Directors
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {metadata.directors.map((director: any) => (
                    <Chip
                      key={director.id}
                      avatar={<Avatar src={director.profilePicture}>{director.name[0]}</Avatar>}
                      label={director.name}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Seasons & Episodes Details */}
      <Card>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            Seasons & Episodes
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {seasons.map((season, seasonIndex) => (
              <Accordion key={seasonIndex}>
                <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip label={`Season ${season.seasonNumber}`} color='primary' />
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      Season {season.seasonNumber}
                    </Typography>
                    <Chip label={`${season.episodes.length} episodes`} size='small' variant='outlined' />
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {season.episodes.map((episode, episodeIndex) => (
                      <Card key={episodeIndex} variant='outlined'>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            s<Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <Chip label={`Episode ${episode.episodeNumber}`} size='small' />
                                <Chip label={`${episode.episodeDuration} min`} size='small' variant='outlined' />
                                <Chip
                                  label={episode.video.status || 'Processing'}
                                  size='small'
                                  color={
                                    episode.video.status === 'READY'
                                      ? 'success'
                                      : episode.video.status === 'FAILED'
                                        ? 'error'
                                        : 'warning'
                                  }
                                />
                              </Box>

                              <Typography variant='body1' sx={{ fontWeight: 600, mb: 1 }}>
                                {episode.episodeTitle}
                              </Typography>

                              <Typography variant='caption' color='text.secondary'>
                                Video: {episode.video.videoUrl || 'Uploaded'}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default TVSeriesReview
