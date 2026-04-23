'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Card, CardContent, Button } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@/components/shared/DataTable'
import StatusBadge from '@/components/shared/StatusBadge'
import { SeasonInfoCell, EpisodeCountCell, SeasonStatsCell, SeasonActionsCell } from '@/components/atoms/SeasonCells'
import { useSeason } from '@/features/content/tvseries/contexts/SeasonContext'

const SeasonTable = () => {
  const { seasons, openAddSeason, openEditSeason, viewSeason, deleteSeason, manageEpisodes } = useSeason()
  const [searchValue, setSearchValue] = useState('')

  const columns: Column[] = [
    { id: 'season', label: 'Season', minWidth: 150 },
    { id: 'episodes', label: 'Episodes', minWidth: 130 },
    { id: 'releaseDate', label: 'Release Date', minWidth: 120 },
    { id: 'stats', label: 'Performance', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 200 }
  ]

  const filteredSeasons = seasons.filter(
    season =>
      season.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      season.description.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <Card>
      <CardContent>
        <DataTable
          columns={columns}
          rows={filteredSeasons.map(season => ({
            ...season,
            season: <SeasonInfoCell season={season} />,
            episodes: <EpisodeCountCell episodes={season.episodes} totalDuration={season.totalDuration} />,
            stats: <SeasonStatsCell stats={season.stats} />,
            status: <StatusBadge status={season.status as any} />,
            actions: (
              <SeasonActionsCell
                season={season}
                onEdit={openEditSeason}
                onView={viewSeason}
                onDelete={deleteSeason}
                onManageEpisodes={manageEpisodes}
              />
            )
          }))}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder='Search seasons...'
          actions={
            <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={openAddSeason}>
              Add Season
            </Button>
          }
          emptyMessage='No seasons found. Add your first season to get started.'
        />
      </CardContent>
    </Card>
  )
}

export default SeasonTable
