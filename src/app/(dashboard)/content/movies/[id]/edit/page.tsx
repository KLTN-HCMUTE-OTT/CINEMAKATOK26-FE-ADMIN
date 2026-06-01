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
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

// API Imports
import { moviesControllerGetMovieById } from '@/api/movies'
import { categoriesControllerGetCategories } from '@/api/categories'
import { tagsControllerGetTags } from '@/api/tags'
import { actorsControllerGetActors } from '@/api/actors'
import { directorsControllerGetDirectors } from '@/api/directors'

// Component Imports
import BasicInfoSection from '@/components/movies/BasicInfoSection'
import MediaUploadSection from '@/components/movies/MediaUploadSection'
import TrailerSection from '@/components/movies/TrailerSection'
import VideoUploadSection from '@/components/movies/VideoUploadSection'
import MovieDetailsSection from '@/components/movies/MovieDetailsSection'
import CategoriesTagsSection from '@/components/movies/CategoriesTagsSection'
import CastCrewSection from '@/components/movies/CastCrewSection'

// Hook Imports
import { useMovieUpdate } from '@/hooks/useMovieUpdate'
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload'

interface MovieEditPageProps {
  params: {
    id: string
  }
}

const MovieEditPage = ({ params }: MovieEditPageProps) => {
  const router = useNextRouter()

  // States
  const [movie, setMovie] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [banner, setBanner] = useState('')
  const [trailer, setTrailer] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [duration, setDuration] = useState(0)
  const [imdbRating, setImdbRating] = useState(0)
  const [avgRating, setAvgRating] = useState(0)
  const [type, setType] = useState<'MOVIE' | 'TV_SERIES'>('MOVIE')
  const [maturityRating, setMaturityRating] = useState<string>('PG-13')
  const [accessTier, setAccessTier] = useState<'BASIC' | 'PREMIUM'>('BASIC')

  // Upload states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  // Selection states
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [actors, setActors] = useState<any[]>([])
  const [directors, setDirectors] = useState<any[]>([])

  const [selectedCategories, setSelectedCategories] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<any[]>([])
  const [selectedActors, setSelectedActors] = useState<any[]>([])
  const [selectedDirectors, setSelectedDirectors] = useState<any[]>([])

  // Custom hooks
  const { uploadingThumbnail, uploadingBanner, uploadThumbnail, uploadBanner } = useCloudinaryUpload()

  const { saving, uploadingVideo, videoUploadProgress, updateMovie } = useMovieUpdate({
    movieId: params.id,
    movie,
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => {
        router.push(`/content/movies/${params.id}`)
      }, 1000)
    },
    onError: (errorMsg: string) => {
      setError(errorMsg)
    }
  })

  // Fetch movie and options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch movie
        const movieResponse = await moviesControllerGetMovieById({ id: params.id })
        const movieData = movieResponse.data.data

        setMovie(movieData)

        // Set form values
        setTitle(movieData.metaData?.title || '')
        setDescription(movieData.metaData?.description || '')
        setThumbnail(movieData.metaData?.thumbnail || '')
        setBanner(movieData.metaData?.banner || '')
        setTrailer(movieData.metaData?.trailer || '')
        setReleaseDate(movieData.metaData?.releaseDate ? movieData.metaData.releaseDate.split('T')[0] : '')
        setDuration(movieData.duration || 0)
        setImdbRating(movieData.metaData?.imdbRating || 0)
        setAvgRating(movieData.metaData?.avgRating || 0)
        setType((movieData.metaData?.type === 'TVSERIES' ? 'TV_SERIES' : 'MOVIE') as any)
        setMaturityRating(movieData.metaData?.maturityRating || 'PG-13')
        setAccessTier((movieData.metaData?.accessTier as 'BASIC' | 'PREMIUM') || 'BASIC')

        setSelectedCategories(movieData.metaData?.categories || [])
        setSelectedTags(movieData.metaData?.tags || [])
        setSelectedActors(movieData.metaData?.actors || [])
        setSelectedDirectors(movieData.metaData?.directors || [])

        // Fetch options
        const [categoriesRes, tagsRes, actorsRes, directorsRes] = await Promise.all([
          categoriesControllerGetCategories({ page: 1, limit: 100 }),
          tagsControllerGetTags({ page: 1, limit: 100 }),
          actorsControllerGetActors({ page: 1, limit: 100 }),
          directorsControllerGetDirectors({ page: 1, limit: 100 })
        ])

        setCategories(categoriesRes.data.data || [])
        setTags(tagsRes.data.data || [])
        setActors(actorsRes.data.data || [])
        setDirectors(directorsRes.data.data || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err?.response?.data?.message || 'Failed to load movie')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  // Handle thumbnail upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setThumbnailFile(file)
      const url = await uploadThumbnail(file)
      setThumbnail(url)
    } catch (err) {
      console.error('Error uploading thumbnail:', err)
      setError('Failed to upload thumbnail')
    }
  }

  // Handle banner upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setBannerFile(file)
      const url = await uploadBanner(file)
      setBanner(url)
    } catch (err) {
      console.error('Error uploading banner:', err)
      setError('Failed to upload banner')
    }
  }

  // Handle video upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)

      // Extract video duration using HTML5 Video API
      try {
        const video = document.createElement('video')
        video.preload = 'metadata'

        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src)
          const durationInSeconds = Math.floor(video.duration)

          // Calculate minutes (round up for API, min 1 minute)
          const totalMinutes = Math.max(1, Math.ceil(durationInSeconds / 60))

          console.log(`Video duration extracted: ${durationInSeconds}s = ${totalMinutes} minutes`)
          setDuration(totalMinutes)
        }

        video.onerror = () => {
          window.URL.revokeObjectURL(video.src)
          console.error('Failed to extract video duration')
        }

        video.src = URL.createObjectURL(file)
      } catch (err) {
        console.error('Error extracting video duration:', err)
      }
    }
  }

  // Handle save
  const handleSave = () => {
    updateMovie({
      title,
      description,
      thumbnail,
      banner,
      trailer,
      releaseDate,
      duration,
      imdbRating,
      avgRating,
      type,
      maturityRating,
      accessTier,
      selectedCategories,
      selectedTags,
      selectedActors,
      selectedDirectors,
      videoFile
    })
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
  if (!movie) {
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
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4'>Edit Movie</Typography>
          <Box display='flex' gap={2}>
            <Button
              variant='outlined'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={() => router.push(`/content/movies/${params.id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              startIcon={saving ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Alerts */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}
      {success && (
        <Grid item xs={12}>
          <Alert severity='success'>Movie updated successfully! Redirecting...</Alert>
        </Grid>
      )}

      {/* Main Form */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              <BasicInfoSection
                title={title}
                description={description}
                type={type}
                maturityRating={maturityRating}
                accessTier={accessTier}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onTypeChange={setType}
                onMaturityRatingChange={setMaturityRating}
                onAccessTierChange={setAccessTier}
              />

              <MediaUploadSection
                thumbnail={thumbnail}
                banner={banner}
                uploadingThumbnail={uploadingThumbnail}
                uploadingBanner={uploadingBanner}
                onThumbnailUpload={handleThumbnailUpload}
                onBannerUpload={handleBannerUpload}
                onRemoveThumbnail={() => {
                  setThumbnail('')
                  setThumbnailFile(null)
                }}
                onRemoveBanner={() => {
                  setBanner('')
                  setBannerFile(null)
                }}
              />

              <TrailerSection trailer={trailer} onTrailerChange={setTrailer} onRemoveTrailer={() => setTrailer('')} />

              <VideoUploadSection
                videoFile={videoFile}
                currentVideoUrl={movie?.video?.videoUrl}
                currentVideoId={movie?.video?.id}
                uploadingVideo={uploadingVideo}
                videoUploadProgress={videoUploadProgress}
                onVideoUpload={handleVideoUpload}
                onRemoveVideo={() => setVideoFile(null)}
              />

              <MovieDetailsSection
                releaseDate={releaseDate}
                duration={duration}
                imdbRating={imdbRating}
                avgRating={avgRating}
                onReleaseDateChange={setReleaseDate}
                onDurationChange={setDuration}
                onImdbRatingChange={setImdbRating}
                onAvgRatingChange={setAvgRating}
              />

              <CategoriesTagsSection
                categories={categories}
                tags={tags}
                selectedCategories={selectedCategories}
                selectedTags={selectedTags}
                onCategoriesChange={setSelectedCategories}
                onTagsChange={setSelectedTags}
              />

              <CastCrewSection
                actors={actors}
                directors={directors}
                selectedActors={selectedActors}
                selectedDirectors={selectedDirectors}
                onActorsChange={setSelectedActors}
                onDirectorsChange={setSelectedDirectors}
              />
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default MovieEditPage
