'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// API Imports
import { moviesControllerGetMovieById, moviesControllerDeleteMovie } from '@/api/movies'

// Component Imports
import { DynamicHLSVideoPlayer, DynamicShakaVideoPlayer } from '@/utils/dynamicImports'

// Config Imports
import { getS3Url } from '@/configs/aws'
import { DialogTrailer } from '@/components/movies/DialogTrailer'
import { DialogVideo } from '@/components/movies/DialogVideo'
import { ContentInfo } from '@/components/content/ContentInfo'
import { ContentCategories } from '@/components/content/ContentCategories'
import { ContentTags } from '@/components/content/ContentTags'
import { ContentCast } from '@/components/content/ContentCast'
import { ContentDirectors } from '@/components/content/ContentDirectors'

interface MovieDetailPageProps {
  params: {
    id: string
  }
}

const MovieDetailPage = ({ params }: MovieDetailPageProps) => {
  // States
  const [movie, setMovie] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [trailerDialogOpen, setTrailerDialogOpen] = useState(false)

  // Hooks
  const router = useRouter()

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await moviesControllerGetMovieById({ id: params.id })

        setMovie(response.data.data)
      } catch (err: any) {
        console.error('Error fetching movie:', err)
        setError(err?.response?.data?.message || 'Failed to load movie details')
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [params.id])

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true)
      await moviesControllerDeleteMovie({ id: params.id })
      router.push('/content/movies')
    } catch (err: any) {
      console.error('Error deleting movie:', err)
      setError(err?.response?.data?.message || 'Failed to delete movie')
      setDeleteDialogOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  // Check if URL is HLS
  const isHLSUrl = (url?: string): boolean => {
    if (!url) {
      return false
    }

    return url.endsWith('.m3u8')
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
  if (error || !movie) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error || 'Movie not found'}</Alert>
          <Box mt={2}>
            <Button variant='contained' onClick={() => router.push('/content/movies')}>
              Back to Movies
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
            <Typography variant='h4'>Movie Details</Typography>
            <Box display='flex' gap={2}>
              <Button
                variant='outlined'
                startIcon={<i className='ri-arrow-left-line' />}
                onClick={() => router.push('/content/movies')}
              >
                Back
              </Button>
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className='ri-edit-line' />}
                onClick={() => router.push(`/content/movies/${params.id}/edit`)}
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
              {/* Thumbnail */}
              {movie.metaData?.thumbnail && (
                <Box mb={4}>
                  <img
                    src={movie.metaData.thumbnail}
                    alt={movie.metaData.title}
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </Box>
              )}

              {/* Video Player Section */}
              {movie.video?.videoUrl && (
                <Box mb={4}>
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                    <Typography variant='h6'>Movie Video</Typography>
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<i className='ri-play-circle-line' />}
                      onClick={() => setVideoDialogOpen(true)}
                    >
                      Watch Movie
                    </Button>
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      paddingTop: '56.25%',
                      backgroundColor: '#000',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    {movie.video?.id ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <DynamicShakaVideoPlayer
                          videoId={movie.video.id}
                          poster={movie.metaData?.thumbnail}
                        />
                      </div>
                    ) : isHLSUrl(movie.video?.videoUrl) ? (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <DynamicHLSVideoPlayer
                          src={getS3Url(movie.video.videoUrl)}
                          poster={movie.metaData?.thumbnail}
                          controls
                        />
                      </div>
                    ) : (
                      <video
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%'
                        }}
                        controls
                        poster={movie.metaData?.thumbnail}
                      >
                        {movie.video?.videoUrl && <source src={getS3Url(movie.video.videoUrl)} type='video/mp4' />}
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </Box>
                </Box>
              )}

              {/* Trailer Section */}
              {movie.metaData?.trailer && (
                <Box mb={4}>
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                    <Typography variant='h6'>Trailer</Typography>
                    <Button
                      variant='outlined'
                      color='primary'
                      startIcon={<i className='ri-movie-line' />}
                      onClick={() => setTrailerDialogOpen(true)}
                    >
                      Watch Trailer
                    </Button>
                  </Box>
                </Box>
              )}
              <ContentInfo
                title={movie.metaData?.title}
                type={movie.metaData?.type || 'MOVIE'}
                status={movie.video?.status}
                description={movie.metaData?.description}
              />

              <ContentCategories categories={movie.metaData?.categories || []} />
              <ContentTags tags={movie.metaData?.tags || []} />

              <Divider sx={{ my: 3 }} />

              <ContentCast actors={movie.metaData?.actors || []} />
              <ContentDirectors directors={movie.metaData?.directors || []} />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Movie Info Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Movie Information
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box display='flex' flexDirection='column' gap={2}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Release Date
                  </Typography>
                  <Typography variant='body2'>
                    {movie.metaData?.releaseDate
                      ? new Date(movie.metaData.releaseDate).toLocaleDateString()
                      : 'Not set'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Duration
                  </Typography>
                  <Typography variant='body2'>{formatDuration(movie.duration)}</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Maturity Rating
                  </Typography>
                  <Typography variant='body2'>{movie.metaData?.maturityRating || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    IMDb Rating
                  </Typography>
                  <Typography variant='body2'>
                    {movie.metaData?.imdbRating != null ? `${movie.metaData.imdbRating}/10` : 'N/A'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Average Rating
                  </Typography>
                  <Typography variant='body2'>
                    {movie.metaData?.avgRating != null ? `${movie.metaData.avgRating}/10` : 'N/A'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Video Status
                  </Typography>
                  <Box>
                    <Chip
                      label={movie.video?.status || 'N/A'}
                      color={movie.video?.status === 'READY' ? 'success' : 'warning'}
                      size='small'
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Access Tier
                  </Typography>
                  <Box>
                    <Chip
                      label={movie.metaData?.accessTier || 'BASIC'}
                      color={movie.metaData?.accessTier === 'PREMIUM' ? 'secondary' : 'default'}
                      variant='outlined'
                      size='small'
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Banner */}
          {movie.metaData?.banner && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Banner
                </Typography>
                <img src={movie.metaData.banner} alt='Banner' style={{ width: '100%', borderRadius: '8px' }} />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Video Dialog */}
      <DialogVideo
        title={movie.metaData?.title}
        thumbnailUrl={movie.metaData?.thumbnail}
        video={movie.video}
        videoDialogOpen={videoDialogOpen}
        setVideoDialogOpen={setVideoDialogOpen}
      />

      {/* Trailer Dialog */}
      <DialogTrailer
        title={movie.metaData?.title}
        trailerUrl={movie.metaData?.trailer}
        trailerDialogOpen={trailerDialogOpen}
        setTrailerDialogOpen={setTrailerDialogOpen}
      />
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Movie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{movie.metaData?.title}&quot;? This action cannot be undone.
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

export default MovieDetailPage
