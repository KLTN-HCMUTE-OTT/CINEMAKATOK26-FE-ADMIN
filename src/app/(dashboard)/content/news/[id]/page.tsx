/* eslint-disable import/order */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Container,
  Stack,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from '@mui/material'
import { newsControllerDeleteNews, newsControllerGetNewsById } from '@/api/news'

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [news, setNews] = useState<API.NewsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true)

        const response = await newsControllerGetNewsById({
          id: params.id as string
        })

        if (response.data.data) {
          setNews(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchNewsDetail()
    }
  }, [params.id])

  // Handle delete
  const handleDelete = async () => {
    try {
      setDeleting(true)
      await newsControllerDeleteNews({ id: params.id as string })
      router.push('/content/news')
    } catch (err: any) {
      console.error('Error deleting news:', err)
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Failed to delete news', severity: 'error' })
      setDeleteDialogOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!news) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <Typography variant='h4' fontWeight='bold'>
          News not found
        </Typography>
        <Button variant='contained' startIcon={<i className='ri-arrow-left-line' />} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Typography variant='h4'>News Details</Typography>
            <Box display='flex' gap={2}>
              <Button
                variant='outlined'
                startIcon={<i className='ri-arrow-left-line' />}
                onClick={() => router.push('/content/news')}
              >
                Back
              </Button>
              <Button
                variant='contained'
                color='primary'
                startIcon={<i className='ri-edit-line' />}
                onClick={() => router.push(`/content/news/${params.id}/edit`)}
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

        <Grid item xs={12}>
          <Card elevation={2}>
            {/* Cover Image */}
            {news.cover_image && (
              <CardMedia
                component='img'
                height='400'
                image={news.cover_image}
                alt={news.title}
                sx={{ objectFit: 'cover' }}
              />
            )}

            <CardContent sx={{ p: 4 }}>
              {/* Title */}
              <Typography variant='h3' fontWeight='bold' gutterBottom className='text-5xl'>
                {news.title}
              </Typography>

              {/* Meta Info */}
              <Stack direction='row' spacing={3} sx={{ mb: 2, color: 'text.secondary' }}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='body2' className='text-base'>
                    {news.author_name}
                  </Typography>
                </Stack>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='body2' className='text-base'>
                    {new Date(news.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Stack>
              </Stack>

              {/* Categories */}
              <Stack direction='row' spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                {news.category.map((cat, index) => (
                  <Chip key={index} label={cat} color='primary' variant='outlined' size='small' />
                ))}
              </Stack>

              {/* Summary */}
              <Typography variant='h6' color='text.secondary' fontStyle='italic' sx={{ mb: 3 }} className='text-xl'>
                {news.summary}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* HTML Content */}
              <Box
                sx={{
                  fontSize: '1.25rem',
                  lineHeight: 1.7,
                  '& img': {
                    maxWidth: '50% !important',
                    maxHeight: '400px !important',
                    width: 'auto !important',
                    height: 'auto !important',
                    display: 'block !important',
                    margin: '2rem auto !important',
                    borderRadius: '8px !important',
                    objectFit: 'contain'
                  },
                  '& p': {
                    marginBottom: 2,
                    fontSize: '1.25rem'
                  },
                  '& h1': {
                    marginTop: 4,
                    marginBottom: 2,
                    fontWeight: 'bold',
                    fontSize: '2rem'
                  },
                  '& h2': {
                    marginTop: 3.5,
                    marginBottom: 2,
                    fontWeight: 'bold',
                    fontSize: '1.75rem'
                  },
                  '& h3': {
                    marginTop: 3,
                    marginBottom: 2,
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                  },
                  '& h4, & h5, & h6': {
                    marginTop: 3,
                    marginBottom: 2,
                    fontWeight: 'bold'
                  },
                  '& ul, & ol': {
                    marginLeft: 3,
                    marginBottom: 2,
                    fontSize: '1.125rem'
                  },
                  '& a': {
                    color: 'primary.main',
                    textDecoration: 'underline'
                  },
                  '& blockquote': {
                    borderLeft: '4px solid',
                    borderColor: 'divider',
                    paddingLeft: 2,
                    marginLeft: 0,
                    marginY: 2,
                    fontStyle: 'italic',
                    color: 'text.secondary'
                  },
                  '& code': {
                    backgroundColor: 'action.hover',
                    padding: '2px 6px',
                    borderRadius: 1,
                    fontSize: '0.9em'
                  },
                  '& pre': {
                    backgroundColor: 'action.hover',
                    padding: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    marginY: 2
                  }
                }}
                dangerouslySetInnerHTML={{ __html: news.content_html }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Author Card */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction='row' spacing={2} alignItems='center'>
                {news.author_avatar && (
                  <Avatar
                    src={typeof news.author_avatar === 'string' ? news.author_avatar : ''}
                    alt={news.author_name}
                    sx={{ width: 64, height: 64 }}
                  />
                )}
                <Box>
                  <Typography variant='subtitle2' fontWeight='bold'>
                    Author
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    {news.author_name}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Actor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{news.title}&quot;? This action cannot be undone.
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
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      ></Snackbar>
    </Container>
  )
}
