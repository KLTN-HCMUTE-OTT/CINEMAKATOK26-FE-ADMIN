'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  Avatar
} from '@mui/material'

import { TableSkeleton } from '@/components/ui/Skeleton'

// API Imports
import { moviesControllerGetMovies, moviesControllerDeleteMovie } from '@/api/movies'

const MoviesPage = () => {
  const router = useRouter()

  // State
  const [movies, setMovies] = useState<API.MovieDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Fetch movies
  const fetchMovies = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await moviesControllerGetMovies({
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        search: debouncedSearchQuery ? JSON.stringify({ title: debouncedSearchQuery }) : undefined
      })

      if (response.data) {
        setMovies(response.data.data || [])
        setTotalCount(response.data.meta?.totalItems || 0)
      }
    } catch (err: any) {
      console.error('Error fetching movies:', err)
      setError(err.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchMovies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedSearchQuery])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(0) // Reset to first page when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return

    try {
      await moviesControllerDeleteMovie({ id })
      fetchMovies() // Refresh list
    } catch (err: any) {
      console.error('Error deleting movie:', err)
      alert(err.message || 'Failed to delete movie')
    }
  }

  const handleView = (id: string) => {
    router.push(`/content/movies/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/content/movies/${id}/edit`)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
            Movies
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Manage your movie content library
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/content/upload')}
        >
          Add Movie
        </Button>
      </Box>

      {/* Search & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder='Search movies by title...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Movies Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Movie</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Release Date</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Access Tier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={rowsPerPage} columns={8} />
              ) : movies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 10 }}>
                    <i className='ri-film-line' style={{ fontSize: '48px', color: '#999' }} />
                    <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                      {searchQuery ? 'No movies found matching your search' : 'No movies yet'}
                    </Typography>
                    {!searchQuery && (
                      <Button
                        variant='contained'
                        sx={{ mt: 2 }}
                        startIcon={<i className='ri-add-line' />}
                        onClick={() => router.push('/content/upload')}
                      >
                        Add Your First Movie
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                movies.map(movie => (
                  <TableRow key={movie.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={movie.metaData?.thumbnail}
                          alt={movie.metaData?.title}
                          variant='rounded'
                          sx={{ width: 60, height: 40 }}
                        >
                          <i className='ri-movie-line' />
                        </Avatar>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {movie.metaData?.title || 'Untitled'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {movie.metaData?.description?.substring(0, 50)}
                            {(movie.metaData?.description?.length || 0) > 50 ? '...' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={movie.metaData?.type || 'MOVIE'} size='small' color='primary' variant='outlined' />
                    </TableCell>
                    <TableCell>
                      {movie.metaData?.releaseDate ? new Date(movie.metaData.releaseDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>{formatDuration(movie.duration)}</TableCell>
                    <TableCell>
                      <Chip label={movie.metaData?.maturityRating || 'N/A'} size='small' />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={movie.metaData?.accessTier || 'BASIC'}
                        size='small'
                        color={movie.metaData?.accessTier === 'PREMIUM' ? 'secondary' : 'default'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={movie.video?.status || 'UNKNOWN'}
                        size='small'
                        color={
                          movie.video?.status === 'READY'
                            ? 'success'
                            : movie.video?.status === 'PROCESSING'
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton size='small' onClick={() => handleView(movie.id)}>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' onClick={() => handleEdit(movie.id)}>
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton size='small' color='error' onClick={() => handleDelete(movie.id)}>
                          <i className='ri-delete-bin-line' />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>
    </Box>
  )
}

export default MoviesPage
