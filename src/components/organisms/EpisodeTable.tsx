'use client'

// React Imports
import { useMemo, useState } from 'react'

// MUI Imports
import { Card, CardContent, Button } from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'
import {
  EpisodeInfoCell,
  SeasonEpisodeCell,
  DurationViewsCell,
  RatingCell,
  EpisodeActionsCell
} from '@components/tables/cells/EpisodeCells'

interface EpisodeTableProps {
  episodes: any[]
  onEdit: (episode: any) => void
  onView: (episode: any) => void
  onDelete: (id: number) => void
  onManageAssets: (episode: any) => void
  onAdd: () => void
}

const EpisodeTable = ({ episodes, onEdit, onView, onDelete, onManageAssets, onAdd }: EpisodeTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const filters = [
    {
      label: 'Season',
      key: 'season',
      options: [
        { value: '1', label: 'Season 1' },
        { value: '2', label: 'Season 2' },
        { value: '3', label: 'Season 3' }
      ]
    },
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'published', label: 'Published' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'draft', label: 'Draft' },
        { value: 'production', label: 'In Production' }
      ]
    }
  ]

  // Filter episodes
  const filteredEpisodes = episodes.filter(episode => {
    const matchesSearch =
      episode.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      episode.description.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'season') return episode.season.toString() === value
      if (key === 'status') return episode.status === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  const mappedRows = useMemo(
    () =>
      filteredEpisodes.map(episode => ({
        ...episode,
        episode: <EpisodeInfoCell episode={episode} />,
        seasonEpisode: <SeasonEpisodeCell season={episode.season} episodeNumber={episode.episodeNumber} />,
        durationViews: <DurationViewsCell duration={episode.duration} views={episode.views} />,
        rating: <RatingCell rating={episode.rating} likes={episode.likes} dislikes={episode.dislikes} />,
        status: <StatusBadge status={episode.status as any} />,
        actions: (
          <EpisodeActionsCell
            episode={episode}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onManageAssets={onManageAssets}
          />
        )
      })),
    [filteredEpisodes, onEdit, onView, onDelete, onManageAssets]
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
          filters={filters}
          filterValues={filterValues}
          onFilterChange={(key, value) => {
            setFilterValues(prev => ({ ...prev, [key]: value }))
            setPage(0)
          }}
          emptyMessage='No episodes found. Add your first episode to get started.'
        >
          <DataTable.Toolbar>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <DataTable.Search placeholder='Search episodes...' />
                <DataTable.Filters />
              </div>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
                Add Episode
              </Button>
            </div>
          </DataTable.Toolbar>
          <DataTable.Column id='episode' label='Episode' minWidth={280} />
          <DataTable.Column id='seasonEpisode' label='S/E' minWidth={80} />
          <DataTable.Column id='durationViews' label='Duration & Views' minWidth={140} />
          <DataTable.Column id='rating' label='Rating' minWidth={120} />
          <DataTable.Column id='releaseDate' label='Release Date' minWidth={120} />
          <DataTable.Column id='status' label='Status' minWidth={120} />
          <DataTable.Column id='actions' label='Actions' minWidth={180} />
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

export default EpisodeTable
