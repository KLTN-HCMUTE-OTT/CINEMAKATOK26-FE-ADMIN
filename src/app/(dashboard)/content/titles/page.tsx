'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  IconButton
} from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Mock data for titles
const mockTitles = [
  {
    id: 1,
    title: 'Stranger Things',
    type: 'Series',
    status: 'published',
    releaseDate: '2024-01-15',
    episodes: 12,
    genre: 'Sci-Fi',
    rating: '8.9',
    views: '2.4M'
  },
  {
    id: 2,
    title: 'The Matrix',
    type: 'Movie',
    status: 'published',
    releaseDate: '2024-02-20',
    episodes: 1,
    genre: 'Action',
    rating: '9.2',
    views: '1.8M'
  },
  {
    id: 3,
    title: 'Breaking Bad Prequel',
    type: 'Series',
    status: 'draft',
    releaseDate: '2024-03-10',
    episodes: 8,
    genre: 'Drama',
    rating: '-',
    views: '0'
  },
  {
    id: 4,
    title: 'Inception Remastered',
    type: 'Movie',
    status: 'transcoding',
    releaseDate: '2024-02-28',
    episodes: 1,
    genre: 'Thriller',
    rating: '9.1',
    views: '0'
  }
]

const typeOptions = [
  { value: 'movie', label: 'Movie' },
  { value: 'series', label: 'Series' }
]

const statusOptions = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'transcoding', label: 'Transcoding' }
]

const genreOptions = [
  { value: 'action', label: 'Action' },
  { value: 'drama', label: 'Drama' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'horror', label: 'Horror' }
]

const ageRatingOptions = [
  { value: 'G', label: 'G - General Audiences' },
  { value: 'PG', label: 'PG - Parental Guidance' },
  { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
  { value: 'R', label: 'R - Restricted' },
  { value: 'NC-17', label: 'NC-17 - Adults Only' }
]

const TitlesPage = () => {
  const [titles, setTitles] = useState(mockTitles)
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [addModalOpen, setAddModalOpen] = useState(false)

  const [newTitle, setNewTitle] = useState({
    title: '',
    type: '',
    releaseDate: '',
    description: '',
    tags: '',
    genre: '',
    ageRating: ''
  })

  // Custom cell components
  const TypeCell = ({ value }: { value: string }) => (
    <Chip label={value} size='small' variant='outlined' color={value === 'Movie' ? 'primary' : 'secondary'} />
  )

  const TitleActionsCell = ({
    titleId,
    onEdit,
    onView,
    onDelete
  }: {
    titleId: number
    onEdit: (id: number) => void
    onView: (id: number) => void
    onDelete: (id: number) => void
  }) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton size='small' onClick={() => onEdit(titleId)}>
        <i className='ri-edit-line' />
      </IconButton>
      <IconButton size='small' onClick={() => onView(titleId)}>
        <i className='ri-eye-line' />
      </IconButton>
      <IconButton size='small' color='error' onClick={() => onDelete(titleId)}>
        <i className='ri-delete-bin-line' />
      </IconButton>
    </Box>
  )

  const columns = [
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'type', label: 'Type', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'releaseDate', label: 'Release Date', minWidth: 120 },
    { id: 'genre', label: 'Genre', minWidth: 100 },
    { id: 'rating', label: 'Rating', minWidth: 80 },
    { id: 'views', label: 'Views', minWidth: 100 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filters = [
    {
      label: 'Type',
      key: 'type',
      options: typeOptions
    },
    {
      label: 'Status',
      key: 'status',
      options: statusOptions
    }
  ]

  const handleEdit = (id: number) => {
    console.log('Edit title:', id)
  }

  const handleView = (id: number) => {
    console.log('View title:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Delete title:', id)
  }

  const handleAddTitle = () => {
    // Mock add functionality
    const id = Math.max(...titles.map(t => t.id)) + 1

    const newTitleData = {
      id,
      title: newTitle.title,
      type: newTitle.type === 'movie' ? 'Movie' : 'Series',
      status: 'draft' as const,
      releaseDate: newTitle.releaseDate,
      episodes: newTitle.type === 'movie' ? 1 : 0,
      genre: newTitle.genre,
      rating: '-',
      views: '0'
    }

    setTitles(prev => [...prev, newTitleData])
    setAddModalOpen(false)
    setNewTitle({
      title: '',
      type: '',
      releaseDate: '',
      description: '',
      tags: '',
      genre: '',
      ageRating: ''
    })
  }

  // Filter titles based on search and filters
  const filteredTitles = titles.filter(title => {
    const matchesSearch = title.title.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'type') return title.type.toLowerCase() === value
      if (key === 'status') return title.status === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Content Titles
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage your streaming content library
        </Typography>
      </Box>

      {/* Data Table */}
      <DataTable
        rows={filteredTitles.map(title => ({
          ...title,
          type: <TypeCell value={title.type} />,
          status: <StatusBadge status={title.status as any} />,
          actions: (
            <TitleActionsCell titleId={title.id} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} />
          )
        }))}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
        emptyMessage='No titles found'
      >
        <DataTable.Toolbar>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <DataTable.Search placeholder='Search titles...' />
              <DataTable.Filters />
            </div>
            <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setAddModalOpen(true)}>
              Add Title
            </Button>
          </div>
        </DataTable.Toolbar>
        {columns.map(column => (
          <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
        ))}
      </DataTable>

      {/* Add Title Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Add New Title</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Title Name'
                value={newTitle.title}
                onChange={e => setNewTitle(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newTitle.type}
                  label='Type'
                  onChange={e => setNewTitle(prev => ({ ...prev, type: e.target.value }))}
                >
                  {typeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='date'
                label='Release Date'
                value={newTitle.releaseDate}
                onChange={e => setNewTitle(prev => ({ ...prev, releaseDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={newTitle.genre}
                  label='Genre'
                  onChange={e => setNewTitle(prev => ({ ...prev, genre: e.target.value }))}
                >
                  {genreOptions.map(option => (
                    <MenuItem key={option.value} value={option.label}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Age Rating</InputLabel>
                <Select
                  value={newTitle.ageRating}
                  label='Age Rating'
                  onChange={e => setNewTitle(prev => ({ ...prev, ageRating: e.target.value }))}
                >
                  {ageRatingOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Tags'
                value={newTitle.tags}
                onChange={e => setNewTitle(prev => ({ ...prev, tags: e.target.value }))}
                placeholder='Action, Adventure, Thriller'
                helperText='Comma-separated tags'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Description'
                value={newTitle.description}
                onChange={e => setNewTitle(prev => ({ ...prev, description: e.target.value }))}
                placeholder='Enter title description...'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleAddTitle}
            disabled={!newTitle.title || !newTitle.type || !newTitle.releaseDate}
          >
            Add Title
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TitlesPage
