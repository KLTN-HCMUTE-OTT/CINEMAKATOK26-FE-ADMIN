'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'

// API Imports
import { categoryControllerFindAll } from '@/api/categories'
import { tagControllerFindAll } from '@/api/tags'
import { actorControllerFindAll } from '@/api/actors'
import { directorControllerFindAll } from '@/api/directors'

// Hooks
import { useCloudinaryImageUpload } from '@/hooks/useCloudinaryImageUpload'

interface TVSeriesMetadataFormProps {
  initialData?: any
  onComplete: (metadata: any) => void
}

const TVSeriesMetadataForm = ({ initialData, onComplete }: TVSeriesMetadataFormProps) => {
  const [metadata, setMetadata] = useState({
    type: 'TVSERIES',
    title: initialData?.title || '',
    description: initialData?.description || '',
    releaseDate: initialData?.releaseDate || '',
    maturityRating: initialData?.maturityRating || 'PG-13',
    thumbnail: initialData?.thumbnail || '',
    banner: initialData?.banner || '',
    trailer: initialData?.trailer || '',
    imdbRating: initialData?.imdbRating || 0,
    avgRating: initialData?.avgRating || 0,
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
    actors: initialData?.actors || [],
    directors: initialData?.directors || []
  })

  // Data states
  const [categories, setCategories] = useState<API.CategoryDto[]>([])
  const [tags, setTags] = useState<API.TagDto[]>([])
  const [actors, setActors] = useState<API.ActorDto[]>([])
  const [directors, setDirectors] = useState<API.DirectorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Custom hooks
  const { uploadingThumbnail, uploadingBanner, uploadThumbnailImage, uploadBannerImage } = useCloudinaryImageUpload()

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const [categoriesRes, tagsRes, actorsRes, directorsRes] = await Promise.all([
          categoryControllerFindAll({ limit: 100 }),
          tagControllerFindAll({ limit: 100 }),
          actorControllerFindAll({ limit: 100 }),
          directorControllerFindAll({ limit: 100 })
        ])

        setCategories(categoriesRes.data.data || [])
        setTags(tagsRes.data.data || [])
        setActors(actorsRes.data.data || [])
        setDirectors(directorsRes.data.data || [])
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError('Failed to load form data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (field: string, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      const url = await uploadThumbnailImage(file)

      handleChange('thumbnail', url)
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Failed to upload thumbnail')
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      const url = await uploadBannerImage(file)

      handleChange('banner', url)
    } catch (error) {
      console.error('Error uploading banner:', error)
      alert('Failed to upload banner')
    }
  }

  const isFormValid = () => {
    return (
      metadata.title.trim() !== '' &&
      metadata.description.trim() !== '' &&
      metadata.releaseDate !== '' &&
      metadata.thumbnail !== '' &&
      metadata.banner !== '' &&
      metadata.categories.length > 0
    )
  }

  const handleSubmit = () => {
    if (isFormValid()) {
      onComplete(metadata)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
          TV Series Information
        </Typography>

        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label='Series Title'
              placeholder='Enter TV series title'
              value={metadata.title}
              onChange={e => handleChange('title', e.target.value)}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={4}
              label='Description'
              placeholder='Enter series description'
              value={metadata.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </Grid>

          {/* Release Date & Maturity Rating */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type='date'
              label='Release Date'
              value={metadata.releaseDate}
              onChange={e => handleChange('releaseDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Maturity Rating</InputLabel>
              <Select
                value={metadata.maturityRating}
                label='Maturity Rating'
                onChange={e => handleChange('maturityRating', e.target.value)}
              >
                <MenuItem value='G'>G - General Audiences</MenuItem>
                <MenuItem value='PG'>PG - Parental Guidance</MenuItem>
                <MenuItem value='PG-13'>PG-13 - Parents Strongly Cautioned</MenuItem>
                <MenuItem value='R'>R - Restricted</MenuItem>
                <MenuItem value='NC-17'>NC-17 - Adults Only</MenuItem>
                <MenuItem value='TV-Y'>TV-Y - All Children</MenuItem>
                <MenuItem value='TV-PG'>TV-PG - Parental Guidance</MenuItem>
                <MenuItem value='TV-14'>TV-14 - Parents Strongly Cautioned</MenuItem>
                <MenuItem value='TV-MA'>TV-MA - Mature Audiences</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Thumbnail Upload */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                Thumbnail Image *
              </Typography>
              <Button
                variant='outlined'
                component='label'
                fullWidth
                disabled={uploadingThumbnail}
                startIcon={uploadingThumbnail ? <CircularProgress size={20} /> : <i className='ri-image-add-line' />}
              >
                {uploadingThumbnail ? 'Uploading...' : metadata.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail'}
                <input type='file' hidden accept='image/*' onChange={handleThumbnailUpload} />
              </Button>
              {metadata.thumbnail && (
                <Box sx={{ mt: 2, position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderRadius: 1 }}>
                  <img
                    src={metadata.thumbnail}
                    alt='Thumbnail preview'
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Banner Upload */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
                Banner Image *
              </Typography>
              <Button
                variant='outlined'
                component='label'
                fullWidth
                disabled={uploadingBanner}
                startIcon={uploadingBanner ? <CircularProgress size={20} /> : <i className='ri-image-add-line' />}
              >
                {uploadingBanner ? 'Uploading...' : metadata.banner ? 'Change Banner' : 'Upload Banner'}
                <input type='file' hidden accept='image/*' onChange={handleBannerUpload} />
              </Button>
              {metadata.banner && (
                <Box sx={{ mt: 2, position: 'relative', paddingTop: '56.25%', overflow: 'hidden', borderRadius: 1 }}>
                  <img
                    src={metadata.banner}
                    alt='Banner preview'
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Trailer URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Trailer URL'
              placeholder='https://www.youtube.com/watch?v=...'
              value={metadata.trailer}
              onChange={e => handleChange('trailer', e.target.value)}
            />
          </Grid>

          {/* Ratings */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type='number'
              label='IMDB Rating'
              placeholder='0.0'
              value={metadata.imdbRating?.toString() ?? ''} // luôn là string
              onChange={e => {
                const value = e.target.value

                handleChange('imdbRating', value === '' ? 0 : parseFloat(value))
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type='number'
              label='Average Rating'
              placeholder='0.0'
              value={metadata.avgRating?.toString() ?? ''} // luôn là string
              onChange={e => {
                const value = e.target.value

                handleChange('avgRating', value === '' ? 0 : parseFloat(value))
              }}
            />
          </Grid>

          {/* Categories */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(option: API.CategoryDto) => option.categoryName}
              value={metadata.categories}
              onChange={(_, newValue) => handleChange('categories', newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id} // ✅ Compare by ID
              renderInput={params => <TextField {...params} label='Categories *' placeholder='Select categories' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.categoryName} />
                ))
              }
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option: API.TagDto) => option.tagName}
              value={metadata.tags}
              onChange={(_, newValue) => handleChange('tags', newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id} // ✅ Compare by ID
              renderInput={params => <TextField {...params} label='Tags' placeholder='Select tags' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.tagName} />
                ))
              }
            />
          </Grid>

          {/* Actors */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={actors}
              getOptionLabel={(option: API.ActorDto) => option.name}
              value={metadata.actors}
              onChange={(_, newValue) => handleChange('actors', newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id} // ✅ Compare by ID
              renderInput={params => <TextField {...params} label='Actors' placeholder='Select actors' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.name} />)
              }
            />
          </Grid>

          {/* Directors */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={directors}
              getOptionLabel={(option: API.DirectorDto) => option.name}
              value={metadata.directors}
              onChange={(_, newValue) => handleChange('directors', newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id} // ✅ Compare by ID
              renderInput={params => <TextField {...params} label='Directors' placeholder='Select directors' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.name} />)
              }
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
              <Button
                variant='contained'
                size='large'
                onClick={handleSubmit}
                disabled={!isFormValid()}
                startIcon={<i className='ri-arrow-right-line' />}
              >
                Continue to Seasons & Episodes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TVSeriesMetadataForm
