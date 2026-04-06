'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'
import { useRouter as useNextRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// API Imports
import { directorControllerFindAll, directorControllerRemove } from '@/api/directors'

const DirectorsPage = () => {
  // States
  const router = useNextRouter()
  const [directors, setDirectors] = useState<API.DirectorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [directorToDelete, setDirectorToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch directors
  const fetchDirectors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await directorControllerFindAll({
        page: page + 1,
        limit: rowsPerPage,
        search: activeSearch || undefined
      })

      setDirectors(response.data.data || [])
      setTotalCount(response.data.meta?.totalItems || 0)
    } catch (err: any) {
      console.error('Error fetching directors:', err)
      setError(err.message || 'Failed to fetch directors')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, activeSearch])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchDirectors()
  }, [fetchDirectors])

  // Search handler
  const handleSearch = () => {
    setActiveSearch(searchQuery)
    if (page !== 0) {
      setPage(0) // Reset to first page, which will trigger fetchDirectors
    }
  }

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Delete handler
  const handleDeleteClick = (id: string) => {
    setDirectorToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!directorToDelete) return

    try {
      setDeleting(true)
      await directorControllerRemove({ id: directorToDelete })
      setDeleteDialogOpen(false)
      setDirectorToDelete(null)
      fetchDirectors() // Refresh list
    } catch (err: any) {
      console.error('Error deleting director:', err)
      setError(err?.response?.data?.message || 'Failed to delete director')
    } finally {
      setDeleting(false)
    }
  }

  // Navigation handlers
  const handleView = (id: string) => {
    router.push(`/person/directors/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/person/directors/${id}/edit`)
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
            <Typography variant='h5'>Directors</Typography>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='ri-add-line' />}
              onClick={() => router.push('/person/directors/create')}
            >
              Add Director
            </Button>
          </Box>

          {/* Search */}
          <Box display='flex' gap={2} mb={4}>
            <TextField
              fullWidth
              size='small'
              placeholder='Search directors by name...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <Button variant='contained' onClick={handleSearch}>
              Search
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity='error' onClose={() => setError(null)} sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}

          {/* Directors Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Nationality</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell>Bio</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <CircularProgress size={40} />
                      <Typography variant='body2' color='text.secondary' mt={2}>
                        Loading directors...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : directors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {searchQuery ? 'No directors found matching your search' : 'No directors yet'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  directors.map(director => (
                    <TableRow key={director.id} hover>
                      <TableCell>
                        <Avatar src={director.profilePicture} alt={director.name}>
                          {director.name?.[0]}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight='medium'>
                          {director.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{director.nationality || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={String(director.gender || 'N/A')}
                          size='small'
                          color={
                            (director.gender as any) === 'MALE'
                              ? 'primary'
                              : (director.gender as any) === 'FEMALE'
                                ? 'secondary'
                                : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {director.dateOfBirth ? new Date(director.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {director.bio || 'No bio available'}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton size='small' onClick={() => handleView(director.id)} title='View'>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' onClick={() => handleEdit(director.id)} title='Edit'>
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteClick(director.id)}
                          title='Delete'
                        >
                          <i className='ri-delete-bin-line' />
                        </IconButton>
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
            labelRowsPerPage='Rows per page:'
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Director</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this director? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained' disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DirectorsPage
