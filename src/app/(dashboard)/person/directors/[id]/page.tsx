'use client'

// React Imports
import { useState, useEffect } from 'react'
import { useRouter as useNextRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// API Imports
import { directorControllerFindOne, directorControllerRemove } from '@/api/directors'

interface DirectorDetailPageProps {
  params: {
    id: string
  }
}

const DirectorDetailPage = ({ params }: DirectorDetailPageProps) => {
  const router = useNextRouter()

  // States
  const [director, setDirector] = useState<API.DirectorDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch director details
  useEffect(() => {
    const fetchDirector = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await directorControllerFindOne({ id: params.id })
        setDirector(response.data.data)
      } catch (err: any) {
        console.error('Error fetching director:', err)
        setError(err?.response?.data?.message || 'Failed to load director details')
      } finally {
        setLoading(false)
      }
    }

    fetchDirector()
  }, [params.id])

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true)
      await directorControllerRemove({ id: params.id })
      router.push('/person/directors')
    } catch (err: any) {
      console.error('Error deleting director:', err)
      setError(err?.response?.data?.message || 'Failed to delete director')
      setDeleteDialogOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error || !director) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error || 'Director not found'}</Alert>
          <Box mt={2}>
            <Button variant='contained' onClick={() => router.push('/person/directors')}>
              Back to Directors
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        {/* Header Actions */}
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='h4'>Director Details</Typography>
            <Box display='flex' gap={2}>
              <Button
                variant='outlined'
                startIcon={<i className='ri-arrow-left-line' />}
                onClick={() => router.push('/person/directors')}
              >
                Back
              </Button>
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className='ri-edit-line' />}
                onClick={() => router.push(`/person/directors/${params.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant='contained'
                color='error'
                startIcon={<i className='ri-delete-bin-line' />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Profile Section */}
              <Box display='flex' alignItems='center' gap={3} mb={4}>
                <Avatar
                  src={director.profilePicture}
                  sx={{ width: 120, height: 180, borderRadius: 2 }}
                  variant='rounded'
                >
                  {director.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    {director.name}
                  </Typography>
                  <Chip
                    label={typeof director.gender === 'string' ? director.gender : 'N/A'}
                    size='small'
                    color={
                      typeof director.gender === 'string'
                        ? director.gender === 'MALE'
                          ? 'primary'
                          : director.gender === 'FEMALE'
                            ? 'secondary'
                            : 'default'
                        : 'default'
                    }
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Biography */}
              <Typography variant='h6' gutterBottom>
                Biography
              </Typography>
              <Typography variant='body1' color='text.secondary' paragraph>
                {director.bio || 'No biography available'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box display='flex' flexDirection='column' gap={2}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Nationality
                  </Typography>
                  <Typography variant='body2'>{director.nationality || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Birth Date
                  </Typography>
                  <Typography variant='body2'>
                    {director.dateOfBirth ? new Date(director.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Gender
                  </Typography>
                  <Typography variant='body2'>
                    {typeof director.gender === 'string' ? director.gender : 'N/A'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Created At
                  </Typography>
                  <Typography variant='body2'>{new Date(director.createdAt).toLocaleString()}</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Updated At
                  </Typography>
                  <Typography variant='body2'>{new Date(director.updatedAt).toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Director</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{director.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color='error' variant='contained' disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DirectorDetailPage
