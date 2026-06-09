import { Card, CardContent, Box, Typography } from '@mui/material'

import type { TempSeason } from '@/hooks/useSeasonManagement'

import SeasonCard from './SeasonCard'

interface SeasonListProps {
  seasons: TempSeason[]
  expandedSeason: number | null
  editingSeason: number | null
  editingEpisode: string | null
  setExpandedSeason: (value: number | null) => void
  setEditingSeason: (value: number | null) => void
  setEditingEpisode: (value: string | null) => void
  handleSaveSeason: (seasonNumber: number, data: Partial<TempSeason>) => void
  handleDeleteSeason: (seasonNumber: number) => void
  handleAddEpisode: (seasonNumber: number) => void
  handleSaveEpisode: (
    seasonNumber: number,
    tempId: string,
    data: {
      episodeTitle: string
      episodeDuration: number
      video: API.UpdateVideoDto
    }
  ) => void
  handleDeleteEpisode: (seasonNumber: number, tempId: string) => void
}

const SeasonList = ({
  seasons,
  expandedSeason,
  editingSeason,
  editingEpisode,
  setExpandedSeason,
  setEditingSeason,
  setEditingEpisode,
  handleSaveSeason,
  handleDeleteSeason,
  handleAddEpisode,
  handleSaveEpisode,
  handleDeleteEpisode
}: SeasonListProps) => {
  if (seasons.length === 0) {
    return (
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
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {seasons.map(season => (
        <SeasonCard
          key={season.seasonNumber}
          season={season}
          expanded={expandedSeason === season.seasonNumber}
          editingSeason={editingSeason}
          editingEpisode={editingEpisode}
          onExpand={isExpanded => setExpandedSeason(isExpanded ? season.seasonNumber : null)}
          onStartEditSeason={setEditingSeason}
          onCancelEditSeason={() => setEditingSeason(null)}
          onSaveSeason={handleSaveSeason}
          onDeleteSeason={handleDeleteSeason}
          onAddEpisode={handleAddEpisode}
          onStartEditEpisode={setEditingEpisode}
          onCancelEditEpisode={() => setEditingEpisode(null)}
          onSaveEpisode={handleSaveEpisode}
          onDeleteEpisode={handleDeleteEpisode}
        />
      ))}
    </Box>
  )
}

export default SeasonList
