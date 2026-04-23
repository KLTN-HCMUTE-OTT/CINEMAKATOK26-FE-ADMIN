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
  CircularProgress,
  Alert,
  Avatar,
  Collapse
} from '@mui/material'

// API Imports
import { tvSeriesControllerGetTvSeries, tvSeriesControllerDeleteTvSeries } from '@/api/tvSeries'

const TVseriesPage = () => {
  const router = useRouter()

  // State
  const [tvSeries, setTvSeries] = useState<API.TVSeriesSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Expandable state
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null)
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null)

  // Fetch TV series
  const fetchTVseries = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await tvSeriesControllerGetTvSeries({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined
      })

      if (response.data) {
        setTvSeries(response.data.data || [])
        setTotalCount(response.data.meta?.totalItems || 0)
      }
    } catch (err: any) {
      console.error('Error fetching TV series:', err)
      setError(err.message || 'Failed to fetch TV series')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchTVseries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchTVseries()
      } else {
        setPage(0)
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this TV series?')) return

    try {
      const result = await tvSeriesControllerDeleteTvSeries({ id })

      if (result.data.statusCode === 200) {
        console.log('TV series deleted successfully')
        alert('TV series deleted successfully')
      }

      fetchTVseries()
    } catch (err: any) {
      console.error('Error deleting TV series:', err)
      alert(err.message || 'Failed to delete TV series')
    }
  }

  const handleView = (id: string) => {
    router.push(`/content/tvseries/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/content/tvseries/${id}/edit`)
  }

  // Toggle series expansion
  const handleToggleSeries = (seriesId: string) => {
    if (expandedSeries === seriesId) {
      setExpandedSeries(null)
      setExpandedSeason(null)
    } else {
      setExpandedSeries(seriesId)
      setExpandedSeason(null)
    }
  }

  // Toggle season expansion
  const handleToggleSeason = (seasonId: string) => {
    setExpandedSeason(expandedSeason === seasonId ? null : seasonId)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
            TV Series
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Manage your TV series content library
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/content/tvseries/upload/content')}
        >
          Add TV Series
        </Button>
      </Box>

      {/* Search & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder='Search TV series by title...'
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

      {/* TV Series Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}></TableCell>
                <TableCell>TV Series</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Release Date</TableCell>
                <TableCell>Total Seasons</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <CircularProgress />
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                      Loading TV series...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tvSeries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <i className='ri-film-line' style={{ fontSize: '48px', color: '#999' }} />
                    <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                      {searchQuery ? 'No TV series found matching your search' : 'No TV series yet'}
                    </Typography>
                    {!searchQuery && (
                      <Button
                        variant='contained'
                        sx={{ mt: 2 }}
                        startIcon={<i className='ri-add-line' />}
                        onClick={() => router.push('/content/upload')}
                      >
                        Add Your First TV Series
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                tvSeries.map(tvShow => {
                  const seasons = ((tvShow as unknown as API.TVSeriesDto).seasons || []) as API.SeasonDto[]

                  return (
                    <>
                      {/* TV Series Row */}
                      <TableRow key={tvShow.id} hover>
                        <TableCell>
                          <IconButton size='small' onClick={() => handleToggleSeries(tvShow.id)}>
                            <i
                              className={
                                expandedSeries === tvShow.id ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'
                              }
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={tvShow.metaData?.thumbnail}
                              alt={tvShow.metaData?.title}
                              variant='rounded'
                              sx={{ width: 60, height: 40 }}
                            >
                              <i className='ri-movie-line' />
                            </Avatar>
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                {tvShow.metaData?.title || 'Untitled'}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {tvShow.metaData?.description?.substring(0, 50)}
                                {(tvShow.metaData?.description?.length || 0) > 50 ? '...' : ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={tvShow.metaData?.type || 'TV SHOW'}
                            size='small'
                            color='primary'
                            variant='outlined'
                          />
                        </TableCell>
                        <TableCell>
                          {tvShow.metaData?.releaseDate
                            ? new Date(tvShow.metaData.releaseDate).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>{tvShow.totalSeasons || seasons.length || 0}</TableCell>
                        <TableCell>
                          <Chip label={tvShow.metaData?.maturityRating || 'N/A'} size='small' />
                        </TableCell>
                        <TableCell align='right'>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton size='small' onClick={() => handleView(tvShow.id)}>
                              <i className='ri-eye-line' />
                            </IconButton>
                            <IconButton size='small' onClick={() => handleEdit(tvShow.id)}>
                              <i className='ri-edit-line' />
                            </IconButton>
                            <IconButton size='small' color='error' onClick={() => handleDelete(tvShow.id)}>
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>

                      {/* Seasons Collapse */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                          <Collapse in={expandedSeries === tvShow.id} timeout='auto' unmountOnExit>
                            <Box sx={{ margin: 2 }}>
                              <Typography variant='h6' gutterBottom component='div' sx={{ fontWeight: 600 }}>
                                Seasons
                              </Typography>
                              <Table size='small'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell width={50}></TableCell>
                                    <TableCell>Season</TableCell>
                                    <TableCell>Episodes</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {seasons.map(season => (
                                    <>
                                      {/* Season Row */}
                                      <TableRow key={season.id}>
                                        <TableCell>
                                          <IconButton size='small' onClick={() => handleToggleSeason(season.id)}>
                                            <i
                                              className={
                                                expandedSeason === season.id
                                                  ? 'ri-arrow-down-s-line'
                                                  : 'ri-arrow-right-s-line'
                                              }
                                            />
                                          </IconButton>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                            Season {season.seasonNumber}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>{season.episodes?.length || 0} episodes</TableCell>
                                      </TableRow>

                                      {/* Episodes Collapse */}
                                      <TableRow>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                                          <Collapse in={expandedSeason === season.id} timeout='auto' unmountOnExit>
                                            <Box sx={{ margin: 2, ml: 4 }}>
                                              <Typography
                                                variant='subtitle2'
                                                gutterBottom
                                                component='div'
                                                sx={{ fontWeight: 600 }}
                                              >
                                                Episodes
                                              </Typography>
                                              <Table size='small'>
                                                <TableHead>
                                                  <TableRow>
                                                    <TableCell>Episode</TableCell>
                                                    <TableCell>Title</TableCell>
                                                    <TableCell>Duration</TableCell>
                                                    <TableCell>Status</TableCell>
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {season.episodes?.map(episode => {
                                                    // Safe status check
                                                    const videoStatus =
                                                      episode.video?.status ?? episode.video?.status ?? 'No Video'

                                                    const statusColor =
                                                      videoStatus === 'READY'
                                                        ? 'success'
                                                        : videoStatus === 'PROCESSING'
                                                          ? 'warning'
                                                          : videoStatus === 'FAILED'
                                                            ? 'error'
                                                            : 'default'

                                                    return (
                                                      <TableRow key={episode.id}>
                                                        <TableCell>
                                                          <Chip label={`E${episode.episodeNumber}`} size='small' />
                                                        </TableCell>
                                                        <TableCell>
                                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant='body2'>
                                                              {episode.episodeTitle ||
                                                                `Episode ${episode.episodeNumber}`}
                                                            </Typography>
                                                          </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                          {episode.episodeDuration
                                                            ? `${Math.floor(episode.episodeDuration / 60)} min`
                                                            : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                          <Chip label={videoStatus} size='small' color={statusColor} />
                                                        </TableCell>
                                                      </TableRow>
                                                    )
                                                  })}
                                                </TableBody>
                                              </Table>
                                            </Box>
                                          </Collapse>
                                        </TableCell>
                                      </TableRow>
                                    </>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && tvSeries.length > 0 && (
          <TablePagination
            component='div'
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Card>
    </Box>
  )
}

export default TVseriesPage
