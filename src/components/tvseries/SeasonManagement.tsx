'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material'

// Components
import SeasonForm from './SeasonForm'
import EpisodeForm from './EpisodeForm'

interface SeasonManagementProps {
  seriesMetadata: any
  initialSeasons?: API.CreateSeasonDto[]
  onComplete: (seasons: API.CreateSeasonDto[]) => void
  onBack: () => void
}

// Temporary episode type for frontend editing (has tempId for React keys)
interface TempEpisode {
  tempId: string
  episodeNumber: number
  episodeTitle: string
  episodeDuration: number
  video?: API.UpdateVideoDto | null // Allow null to handle existing data
}

interface TempSeason {
  seasonNumber: number
  episodes: TempEpisode[]
}

const SeasonManagement = ({ seriesMetadata, initialSeasons = [], onComplete, onBack }: SeasonManagementProps) => {
  const [seasons, setSeasons] = useState<TempSeason[]>(
    initialSeasons.map(s => ({
      ...s,
      episodes: s.episodes.map(e => ({
        ...e,
        tempId: `temp-${Date.now()}-${Math.random()}`,
        video: e.video || null // Handle null video
      }))
    }))
  )

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null)
  const [editingSeason, setEditingSeason] = useState<number | null>(null)
  const [editingEpisode, setEditingEpisode] = useState<string | null>(null)

  // Validation dialog state
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Show initial warning if any episode has no video
  useEffect(() => {
    const episodesWithoutVideo = getEpisodesWithoutVideo()

    if (episodesWithoutVideo > 0) {
      console.warn(`⚠️ ${episodesWithoutVideo} episode(s) are missing videos!`)
    }
  }, [])

  const handleAddSeason = () => {
    const newSeason: TempSeason = {
      seasonNumber: seasons.length + 1,
      episodes: []
    }

    const updatedSeasons = [...seasons, newSeason]

    setSeasons(updatedSeasons)
  }

  const handleSaveSeason = (seasonNumber: number, seasonData: Partial<TempSeason>) => {
    setSeasons(seasons.map(s => (s.seasonNumber === seasonNumber ? { ...s, ...seasonData } : s)))
    setEditingSeason(null)
  }

  const handleDeleteSeason = (seasonNumber: number) => {
    if (confirm('Are you sure you want to delete this season and all its episodes?')) {
      const updatedSeasons = seasons
        .filter(s => s.seasonNumber !== seasonNumber)
        .map((s, index) => ({
          ...s,
          seasonNumber: index + 1
        }))

      setSeasons(updatedSeasons)

      if (expandedSeason === seasonNumber) {
        setExpandedSeason(null)
      }
    }
  }

  const handleAddEpisode = (seasonNumber: number) => {
    const season = seasons.find(s => s.seasonNumber === seasonNumber)

    if (!season) return

    const newEpisode: TempEpisode = {
      tempId: `temp-${Date.now()}-${Math.random()}`,
      episodeNumber: season.episodes.length + 1,
      episodeTitle: '',
      episodeDuration: 0,
      video: null // Start with null
    }

    setSeasons(
      seasons.map(s =>
        s.seasonNumber === seasonNumber
          ? {
              ...s,
              episodes: [...s.episodes, newEpisode]
            }
          : s
      )
    )

    setEditingEpisode(newEpisode.tempId)
  }

  const handleSaveEpisode = (
    seasonNumber: number,
    tempId: string,
    episodeData: {
      episodeTitle: string
      episodeDuration: number
      video: API.UpdateVideoDto
    }
  ) => {
    setSeasons(
      seasons.map(s =>
        s.seasonNumber === seasonNumber
          ? {
              ...s,
              episodes: s.episodes.map(e => (e.tempId === tempId ? { ...e, ...episodeData } : e))
            }
          : s
      )
    )
    setEditingEpisode(null)
  }

  const handleDeleteEpisode = (seasonNumber: number, tempId: string) => {
    if (confirm('Are you sure you want to delete this episode?')) {
      setSeasons(
        seasons.map(s =>
          s.seasonNumber === seasonNumber
            ? {
                ...s,
                episodes: s.episodes
                  .filter(e => e.tempId !== tempId)
                  .map((e, index) => ({
                    ...e,
                    episodeNumber: index + 1
                  }))
              }
            : s
        )
      )
    }
  }

  const handleComplete = () => {
    const errors: string[] = []

    // Validate: Must have at least one season
    if (seasons.length === 0) {
      errors.push('TV series must have at least one season')
    }

    // Validate: Each season must have at least one episode
    const seasonsWithoutEpisodes = seasons.filter(s => s.episodes.length === 0)

    if (seasonsWithoutEpisodes.length > 0) {
      seasonsWithoutEpisodes.forEach(s => {
        errors.push(`Season ${s.seasonNumber} has no episodes (minimum 1 required)`)
      })
    }

    // Validate: Each episode must have all required fields
    seasons.forEach(season => {
      season.episodes.forEach(episode => {
        const episodeErrors: string[] = []

        if (!episode.episodeTitle || episode.episodeTitle.trim() === '') {
          episodeErrors.push('missing title')
        }

        if (!episode.episodeDuration || episode.episodeDuration <= 0) {
          episodeErrors.push('invalid duration (must be > 0)')
        }

        // ✅ CRITICAL: Episode must have a video with videoUrl
        if (!episode.video || episode.video === null || !episode.video.videoUrl) {
          episodeErrors.push('NO VIDEO UPLOADED (REQUIRED)')
        }

        if (episodeErrors.length > 0) {
          errors.push(`Season ${season.seasonNumber}, Episode ${episode.episodeNumber}: ${episodeErrors.join(', ')}`)
        }
      })
    })

    // Show validation errors if any
    if (errors.length > 0) {
      console.error('Validation failed:', errors)
      setValidationErrors(errors)
      setValidationDialogOpen(true)

      return
    }

    // Clean up tempId before sending to parent
    const cleanedSeasons: API.CreateSeasonDto[] = seasons.map(s => ({
      seasonNumber: s.seasonNumber,
      episodes: s.episodes.map(e => {
        // TypeScript guard - this should never happen due to validation above
        if (!e.video || e.video === null || !e.video.videoUrl) {
          throw new Error(`Episode ${e.episodeNumber} is missing video data`)
        }

        return {
          episodeNumber: e.episodeNumber,
          episodeTitle: e.episodeTitle,
          episodeDuration: e.episodeDuration,
          video: e.video
        }
      })
    }))

    onComplete(cleanedSeasons)
  }

  const getTotalEpisodes = () => {
    return seasons.reduce((total, season) => total + season.episodes.length, 0)
  }

  const getEpisodesWithoutVideo = () => {
    let count = 0

    seasons.forEach(season => {
      season.episodes.forEach(episode => {
        // Check videoUrl specifically
        if (!episode.video || episode.video === null || !episode.video.videoUrl) count++
      })
    })

    return count
  }

  const episodesWithoutVideoCount = getEpisodesWithoutVideo()

  return (
    <Box>
      {/* Show critical warning at the top if episodes are missing videos */}
      {episodesWithoutVideoCount > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          <Typography variant='body1' sx={{ fontWeight: 600, mb: 1 }}>
            {episodesWithoutVideoCount} Episode{episodesWithoutVideoCount > 1 ? 's' : ''} Missing Videos!
          </Typography>
          <Typography variant='body2'>
            You must upload videos for all episodes before you can continue. Episodes without videos cannot be
            published.
          </Typography>
        </Alert>
      )}

      {/* Header with Stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Seasons & Episodes
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip label={`${seasons.length} Seasons`} color='primary' />
              <Chip label={`${getTotalEpisodes()} Episodes`} color='secondary' />
              {/* Show warning if episodes missing videos */}
              {episodesWithoutVideoCount > 0 && (
                <Chip
                  label={`${episodesWithoutVideoCount} without video`}
                  color='error'
                  icon={<i className='ri-alert-line' />}
                />
              )}
            </Box>
          </Box>

          <Alert severity='info' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              <strong>Series:</strong> {seriesMetadata.title}
            </Typography>
            <Typography variant='body2' sx={{ mt: 1 }}>
              <strong>Important:</strong> Each episode MUST have a video uploaded before you can continue.
            </Typography>
          </Alert>

          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={handleAddSeason}
            fullWidth
            size='large'
          >
            Add New Season
          </Button>
        </CardContent>
      </Card>

      {/* Seasons List */}
      {seasons.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <i className='ri-film-line' style={{ fontSize: '64px', color: '#999' }} />
            <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
              No Seasons Yet
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Click the button above to add your first season
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {seasons.map(season => (
            <Card key={season.seasonNumber}>
              <Accordion
                expanded={expandedSeason === season.seasonNumber}
                onChange={(_, isExpanded) => setExpandedSeason(isExpanded ? season.seasonNumber : null)}
              >
                <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Chip label={`Season ${season.seasonNumber}`} color='primary' />
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      Season {season.seasonNumber}
                    </Typography>
                    <Chip label={`${season.episodes.length} episodes`} size='small' variant='outlined' />
                    {/* Warning if season has episodes without video - CHECK videoUrl */}
                    {season.episodes.some(e => !e.video || e.video === null || !e.video?.videoUrl) && (
                      <Chip label='Missing videos' size='small' color='error' icon={<i className='ri-alert-line' />} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
                    <IconButton size='small' onClick={() => setEditingSeason(season.seasonNumber)}>
                      <i className='ri-edit-line' />
                    </IconButton>
                    <IconButton size='small' color='error' onClick={() => handleDeleteSeason(season.seasonNumber)}>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  {/* Season Edit Form */}
                  {editingSeason === season.seasonNumber && (
                    <Box sx={{ mb: 3 }}>
                      <SeasonForm
                        season={season}
                        onSave={data => handleSaveSeason(season.seasonNumber, data)}
                        onCancel={() => setEditingSeason(null)}
                      />
                      <Divider sx={{ my: 3 }} />
                    </Box>
                  )}

                  {/* Episodes List */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                        Episodes
                      </Typography>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<i className='ri-add-line' />}
                        onClick={() => handleAddEpisode(season.seasonNumber)}
                      >
                        Add Episode
                      </Button>
                    </Box>

                    {season.episodes.length === 0 ? (
                      <Alert severity='error'>
                        This season has no episodes yet. <strong>Add at least one episode with a video.</strong>
                      </Alert>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {season.episodes.map(episode => (
                          <Card key={episode.tempId} variant='outlined'>
                            <CardContent>
                              {editingEpisode === episode.tempId ? (
                                <EpisodeForm
                                  episode={episode}
                                  onSave={data => handleSaveEpisode(season.seasonNumber, episode.tempId!, data)}
                                  onCancel={() => setEditingEpisode(null)}
                                />
                              ) : (
                                <Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                          <Chip label={`E${episode.episodeNumber}`} size='small' />
                                          {episode.episodeDuration > 0 && (
                                            <Chip
                                              label={`${episode.episodeDuration} min`}
                                              size='small'
                                              variant='outlined'
                                            />
                                          )}
                                        </Box>
                                        <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
                                          {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                                        </Typography>
                                        {/* Video status with clear indication (check for null) */}
                                        {episode.video && episode.video !== null && episode.video.videoUrl ? (
                                          <Chip
                                            label='✓ Video uploaded'
                                            size='small'
                                            color='success'
                                            icon={<i className='ri-check-line' />}
                                          />
                                        ) : (
                                          <Chip
                                            label='No video - REQUIRED'
                                            size='small'
                                            color='error'
                                            icon={<i className='ri-alert-line' />}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <IconButton size='small' onClick={() => setEditingEpisode(episode.tempId!)}>
                                        <i className='ri-edit-line' />
                                      </IconButton>
                                      <IconButton
                                        size='small'
                                        color='error'
                                        onClick={() => handleDeleteEpisode(season.seasonNumber, episode.tempId!)}
                                      >
                                        <i className='ri-delete-bin-line' />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Card>
          ))}
        </Box>
      )}

      {/* Action Buttons */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onBack} startIcon={<i className='ri-arrow-left-line' />}>
              Back to Metadata
            </Button>
            <Button
              variant='contained'
              size='large'
              onClick={handleComplete}
              disabled={seasons.length === 0 || getTotalEpisodes() === 0 || episodesWithoutVideoCount > 0}
              startIcon={<i className='ri-arrow-right-line' />}
            >
              Continue to Review
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Validation Error Dialog */}
      <Dialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-error-warning-line' style={{ color: '#f44336' }} />
          Validation Failed
        </DialogTitle>
        <DialogContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            Please fix the following issues before continuing:
          </Alert>
          <List dense>
            {validationErrors.map((error, index) => (
              <ListItem key={index}>
                <ListItemText primary={error} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialogOpen(false)} variant='contained'>
            OK, I&apos;ll fix it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SeasonManagement
