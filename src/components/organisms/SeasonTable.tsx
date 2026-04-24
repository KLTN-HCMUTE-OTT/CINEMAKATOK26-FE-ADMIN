'use client'

// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import { Card, CardContent, Button } from '@mui/material'

// Components Imports
import DataTable from '@/components/shared/DataTable'
import StatusBadge from '@/components/shared/StatusBadge'
import {
  SeasonInfoCell,
  EpisodeCountCell,
  SeasonStatsCell,
  SeasonActionsCell
} from '@/components/tables/cells/SeasonCells'
import { useSeason } from '@/features/content/tvseries/contexts/SeasonContext'

const SeasonTable = () => {
  const { seasons, openAddSeason, openEditSeason, viewSeason, deleteSeason, manageEpisodes } = useSeason()
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const filteredSeasons = seasons.filter(
    season =>
      season.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      season.description.toLowerCase().includes(searchValue.toLowerCase())
  )

  const mappedRows = useMemo(
    () =>
      filteredSeasons.map(season => ({
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
      })),
    [filteredSeasons, openEditSeason, viewSeason, deleteSeason, manageEpisodes]
  )

  const pagedRows = useMemo(
    () => mappedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [mappedRows, page, rowsPerPage]
  )

  return (
    <Card>
      <CardContent>
        <DataTable
          rows={pagedRows}
          searchValue={searchValue}
          onSearchChange={value => {
            setSearchValue(value)
            setPage(0)
          }}
          emptyMessage='No seasons found. Add your first season to get started.'
        >
          <DataTable.Toolbar>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <DataTable.Search placeholder='Search seasons...' />
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={openAddSeason}>
                Add Season
              </Button>
            </div>
          </DataTable.Toolbar>
          <DataTable.Column id='season' label='Season' minWidth={150} />
          <DataTable.Column id='episodes' label='Episodes' minWidth={130} />
          <DataTable.Column id='releaseDate' label='Release Date' minWidth={120} />
          <DataTable.Column id='stats' label='Performance' minWidth={150} />
          <DataTable.Column id='status' label='Status' minWidth={120} />
          <DataTable.Column id='actions' label='Actions' minWidth={200} />
          <DataTable.Pagination
            totalCount={mappedRows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={nextRowsPerPage => {
              setRowsPerPage(nextRowsPerPage)
              setPage(0)
            }}
          />
        </DataTable>
      </CardContent>
    </Card>
  )
}

export default SeasonTable
