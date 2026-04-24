import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Typography,
  IconButton,
  Divider,
  Button,
  Alert
} from '@mui/material'

import type { TempSeason } from '@/hooks/useSeasonManagement'

import SeasonForm from '../SeasonForm'
import EpisodeForm from '../EpisodeForm'

interface SeasonCardProps {
  season: TempSeason
  expanded: boolean
  editingSeason: number | null
  editingEpisode: string | null
  onExpand: (expanded: boolean) => void
  onStartEditSeason: (seasonNumber: number) => void
  onCancelEditSeason: () => void
  onSaveSeason: (seasonNumber: number, data: Partial<TempSeason>) => void
  onDeleteSeason: (seasonNumber: number) => void
  onAddEpisode: (seasonNumber: number) => void
  onStartEditEpisode: (tempId: string) => void
  onCancelEditEpisode: () => void
  onSaveEpisode: (
    seasonNumber: number,
    tempId: string,
    data: {
      episodeTitle: string
      episodeDuration: number
      video: API.UpdateVideoDto
    }
  ) => void
  onDeleteEpisode: (seasonNumber: number, tempId: string) => void
}

const SeasonCard = ({
  season,
  expanded,
  editingSeason,
  editingEpisode,
  onExpand,
  onStartEditSeason,
  onCancelEditSeason,
  onSaveSeason,
  onDeleteSeason,
  onAddEpisode,
  onStartEditEpisode,
  onCancelEditEpisode,
  onSaveEpisode,
  onDeleteEpisode
}: SeasonCardProps) => {
  return (
    <Card>
      <Accordion expanded={expanded} onChange={(_, isExpanded) => onExpand(isExpanded)}>
        <AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Chip label={`Season ${season.seasonNumber}`} color='primary' />
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              Season {season.seasonNumber}
            </Typography>
            <Chip label={`${season.episodes.length} episodes`} size='small' variant='outlined' />
            {season.episodes.some(e => !e.video || e.video === null || !e.video?.videoUrl) && (
              <Chip label='Missing videos' size='small' color='error' icon={<i className='ri-alert-line' />} />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
            <IconButton size='small' onClick={() => onStartEditSeason(season.seasonNumber)}>
              <i className='ri-edit-line' />
            </IconButton>
            <IconButton size='small' color='error' onClick={() => onDeleteSeason(season.seasonNumber)}>
              <i className='ri-delete-bin-line' />
            </IconButton>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {editingSeason === season.seasonNumber && (
            <Box sx={{ mb: 3 }}>
              <SeasonForm
                season={season}
                onSave={data => onSaveSeason(season.seasonNumber, data)}
                onCancel={onCancelEditSeason}
              />
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                Episodes
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<i className='ri-add-line' />}
                onClick={() => onAddEpisode(season.seasonNumber)}
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
                          onSave={data => onSaveEpisode(season.seasonNumber, episode.tempId, data)}
                          onCancel={onCancelEditEpisode}
                        />
                      ) : (
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                  <Chip label={`E${episode.episodeNumber}`} size='small' />
                                  {episode.episodeDuration > 0 && (
                                    <Chip label={`${episode.episodeDuration} min`} size='small' variant='outlined' />
                                  )}
                                </Box>
                                <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                                </Typography>
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
                              <IconButton size='small' onClick={() => onStartEditEpisode(episode.tempId)}>
                                <i className='ri-edit-line' />
                              </IconButton>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => onDeleteEpisode(season.seasonNumber, episode.tempId)}
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
  )
}

export default SeasonCard
