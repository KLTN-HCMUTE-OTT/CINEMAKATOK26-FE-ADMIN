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
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// API Imports
import { actorsControllerGetActors, actorsControllerDeleteActor } from '@/api/actors'

const ActorsPage = () => {
  // States
  const router = useNextRouter()
  const [actors, setActors] = useState<API.ActorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [actorToDelete, setActorToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch actors
  const fetchActors = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await actorsControllerGetActors({
        page: page + 1,
        limit: rowsPerPage,
        search: activeSearch || undefined
      })

      setActors(response.data.data || [])
      setTotalCount(response.data.meta?.totalItems || 0)
    } catch (err: any) {
      console.error('Error fetching actors:', err)
      setError(err.message || 'Failed to fetch actors')
    } finally {
      setLoading(false)
    }
  }, [page, rowsPerPage, activeSearch])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchActors()
  }, [fetchActors])

  // Search handler
  const handleSearch = () => {
    setActiveSearch(searchQuery)
    if (page !== 0) {
      setPage(0) // Reset to first page, which will trigger fetchActors
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
    setActorToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!actorToDelete) return

    try {
      setDeleting(true)
      await actorsControllerDeleteActor({ id: actorToDelete })
      setDeleteDialogOpen(false)
      setActorToDelete(null)
      fetchActors() // Refresh list
    } catch (err: any) {
      console.error('Error deleting actor:', err)
      setError(err?.response?.data?.message || 'Failed to delete actor')
    } finally {
      setDeleting(false)
    }
  }

  // Navigation handlers
  const handleView = (id: string) => {
    router.push(`/person/actors/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/person/actors/${id}/edit`)
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
            <Typography variant='h5'>Actors</Typography>
            <Button
              variant='contained'
              color='primary'
              startIcon={<i className='ri-add-line' />}
              onClick={() => router.push('/person/actors/create')}
            >
              Add Actor
            </Button>
          </Box>

          {/* Search */}
          <Box display='flex' gap={2} mb={4}>
            <TextField
              fullWidth
              size='small'
              placeholder='Search actors by name...'
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

          {/* Actors Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Nationality</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <CircularProgress size={40} />
                      <Typography variant='body2' color='text.secondary' mt={2}>
                        Loading actors...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : actors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {searchQuery ? 'No actors found matching your search' : 'No actors yet'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  actors.map(actor => (
                    <TableRow key={actor.id} hover>
                      <TableCell>
                        <Avatar src={actor.profilePicture} alt={actor.name}>
                          {actor.name?.[0]}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight='medium'>
                          {actor.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{actor.nationality || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={actor.gender || 'N/A'}
                          size='small'
                          color={
                            actor.gender === 'MALE' ? 'primary' : actor.gender === 'FEMALE' ? 'secondary' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {actor.dateOfBirth ? new Date(actor.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton size='small' onClick={() => handleView(actor.id)} title='View'>
                          <i className='ri-eye-line' />
                        </IconButton>
                        <IconButton size='small' onClick={() => handleEdit(actor.id)} title='Edit'>
                          <i className='ri-edit-line' />
                        </IconButton>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteClick(actor.id)}
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
        <DialogTitle>Delete Actor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this actor? This action cannot be undone.
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

export default ActorsPage
