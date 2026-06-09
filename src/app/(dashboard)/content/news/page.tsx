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
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'

import { TableSkeleton } from '@/components/ui/Skeleton'

import { newsControllerDeleteNews, newsControllerGetNews } from '@/api/news'

const NewsPage = () => {
  const router = useRouter()

  // State
  const [news, setNews] = useState<API.NewsDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null)
  const [selectedNewsTitle, setSelectedNewsTitle] = useState<string>('')
  const [deleting, setDeleting] = useState(false)

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  })

  // Fetch news
  const fetchNews = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await newsControllerGetNews({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearchQuery
      })

      if (response.data) {
        setNews(response.data.data || [])
        setTotalCount(response.data.meta?.totalItems || 0)
      }
    } catch (err: any) {
      console.error('Error fetching news:', err)
      setError(err.message || 'Failed to fetch news')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedSearchQuery])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(0)
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

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Open delete dialog
  const openDeleteDialog = (id: string, title: string) => {
    setSelectedNewsId(id)
    setSelectedNewsTitle(title)
    setDeleteDialogOpen(true)
  }

  // Close delete dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setSelectedNewsId(null)
    setSelectedNewsTitle('')
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedNewsId) return

    try {
      setDeleting(true)
      const result = await newsControllerDeleteNews({ id: selectedNewsId })

      if (result.data.statusCode === 200) {
        setSnackbar({
          open: true,
          message: 'News deleted successfully!',
          severity: 'success'
        })
        fetchNews()
        closeDeleteDialog()
      }
    } catch (err: any) {
      console.error('Error deleting news item:', err)
      setSnackbar({
        open: true,
        message: err.message || 'Failed to delete news item',
        severity: 'error'
      })
      closeDeleteDialog()
    } finally {
      setDeleting(false)
    }
  }

  const handleView = (id: string) => {
    router.push(`/content/news/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/content/news/${id}/edit`)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
            News Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Manage your news content library
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/content/news/add-news')}
        >
          Add News
        </Button>
      </Box>

      {/* Search & Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder='Search news by title...'
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

      {/* News Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Release Date</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Author</TableCell>
                <TableCell align='right'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableSkeleton rows={rowsPerPage} columns={6} />
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 10 }}>
                    <i className='ri-newspaper-line' style={{ fontSize: '48px', color: '#999' }} />
                    <Typography variant='body1' color='text.secondary' sx={{ mt: 2 }}>
                      {searchQuery ? 'No news found matching your search' : 'No news yet'}
                    </Typography>
                    {!searchQuery && (
                      <Button
                        variant='contained'
                        sx={{ mt: 2 }}
                        startIcon={<i className='ri-add-line' />}
                        onClick={() => router.push('/content/news/upload/content')}
                      >
                        Add Your First News
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                news.map(newsItem => (
                  <TableRow key={newsItem.id} hover>
                    {/* Title */}
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {newsItem.title || 'Untitled'}
                      </Typography>
                    </TableCell>
                    {/* Release Date */}
                    <TableCell>
                      {newsItem.createdAt
                        ? new Date(newsItem.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : '-'}
                    </TableCell>
                    {/* Summary */}
                    <TableCell>
                      <Typography variant='caption' color='text.secondary'>
                        {newsItem.summary?.substring(0, 50)}
                        {(newsItem.summary?.length || 0) > 50 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    {/* Category */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {newsItem.category && Array.isArray(newsItem.category) && newsItem.category.length > 0 ? (
                          newsItem.category.map((cat, index) => (
                            <Chip key={index} label={cat} size='small' color='primary' variant='outlined' />
                          ))
                        ) : (
                          <Chip label='N/A' size='small' color='default' variant='outlined' />
                        )}
                      </Box>
                    </TableCell>
                    {/* Author */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={typeof newsItem.author_avatar === 'string' ? newsItem.author_avatar : ''}
                          alt={newsItem.author_name || 'Author'}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Typography variant='body2'>{newsItem.author_name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    {/* Actions */}
                    <TableCell align='right'>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton size='small' onClick={() => handleView(newsItem.id)}>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' onClick={() => handleEdit(newsItem.id)}>
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => openDeleteDialog(newsItem.id, newsItem.title)}
                        >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete News</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{selectedNewsTitle}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error' variant='contained' disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default NewsPage
