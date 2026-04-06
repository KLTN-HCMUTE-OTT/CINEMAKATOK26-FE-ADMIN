// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  LinearProgress,
  Chip,
  Autocomplete
} from '@mui/material'

interface VideoMetadata {
  type: 'MOVIE' | 'TVSERIES'
  title: string
  description: string
  releaseDate: string
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-Y' | 'TV-PG' | 'TV-14' | 'TV-MA'
  thumbnail: string
  banner: string
  trailer: string
  imdbRating: number
  avgRating: number
  categories: Array<{ id: string; categoryName: string }>
  tags: Array<{ id: string; tagName: string }>
  actors: Array<{ id: string; name: string }>
  directors: Array<{ id: string; name: string }>
}

interface MetadataFormProps {
  metadata: VideoMetadata
  categories: any[]
  tags: any[]
  actors: any[]
  directors: any[]
  loading: boolean
  uploadingThumbnail: boolean
  uploadingBanner: boolean
  onMetadataChange: (metadata: VideoMetadata) => void
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const maturityRatingOptions = [
  { value: 'G', label: 'G - General Audiences' },
  { value: 'PG', label: 'PG - Parental Guidance' },
  { value: 'PG-13', label: 'PG-13 - Parents Strongly Cautioned' },
  { value: 'R', label: 'R - Restricted' },
  { value: 'NC-17', label: 'NC-17 - Adults Only' },
  { value: 'TV-Y', label: 'TV-Y - All Children' },
  { value: 'TV-PG', label: 'TV-PG - Parental Guidance Suggested' },
  { value: 'TV-14', label: 'TV-14 - Parents Strongly Cautioned' },
  { value: 'TV-MA', label: 'TV-MA - Mature Audience Only' }
] as const

const contentTypeOptions = [
  { value: 'MOVIE', label: 'Movie' },
  { value: 'TVSERIES', label: 'TV Series' }
] as const

const MetadataForm = ({
  metadata,
  categories,
  tags,
  actors,
  directors,
  loading,
  uploadingThumbnail,
  uploadingBanner,
  onMetadataChange,
  onThumbnailUpload,
  onBannerUpload
}: MetadataFormProps) => {
  const setMetadata = onMetadataChange

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3 }}>
          Content Metadata
        </Typography>
        <Grid container spacing={2}>
          {/* Content Type & Rating */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={metadata.type}
                label='Content Type'
                onChange={e => setMetadata({ ...metadata, type: e.target.value as 'MOVIE' | 'TVSERIES' })}
              >
                {contentTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Maturity Rating</InputLabel>
              <Select
                value={metadata.maturityRating}
                label='Maturity Rating'
                onChange={e =>
                  setMetadata({
                    ...metadata,
                    maturityRating: e.target.value as VideoMetadata['maturityRating']
                  })
                }
              >
                {maturityRatingOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Title & Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Title'
              value={metadata.title}
              onChange={e => setMetadata({ ...metadata, title: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Description'
              value={metadata.description}
              onChange={e => setMetadata({ ...metadata, description: e.target.value })}
              required
            />
          </Grid>

          {/* Release Date */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Release Date'
              type='date'
              value={metadata.releaseDate}
              onChange={e => setMetadata({ ...metadata, releaseDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          {/* IMDb Rating & Average Rating */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='IMDb Rating'
              type='number'
              value={metadata.imdbRating}
              onChange={e => setMetadata({ ...metadata, imdbRating: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              helperText='Rating from 0 to 10'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Average Rating'
              type='number'
              value={metadata.avgRating}
              onChange={e => setMetadata({ ...metadata, avgRating: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              helperText='Average user rating (0-10)'
            />
          </Grid>

          {/* Thumbnail Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Thumbnail Image
              </Typography>
              <input
                type='file'
                accept='image/*'
                onChange={onThumbnailUpload}
                style={{ display: 'none' }}
                id='thumbnail-upload-input'
                disabled={uploadingThumbnail}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label htmlFor='thumbnail-upload-input'>
                  <Button
                    variant='outlined'
                    component='span'
                    startIcon={
                      uploadingThumbnail ? (
                        <i className='ri-loader-4-line animate-spin' />
                      ) : (
                        <i className='ri-image-add-line' />
                      )
                    }
                    disabled={uploadingThumbnail}
                  >
                    {uploadingThumbnail ? 'Uploading...' : 'Choose Thumbnail'}
                  </Button>
                </label>
                {metadata.thumbnail && !uploadingThumbnail && (
                  <>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      onClick={() => setMetadata({ ...metadata, thumbnail: '' })}
                      startIcon={<i className='ri-delete-bin-line' />}
                    >
                      Remove
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => window.open(metadata.thumbnail, '_blank')}
                      startIcon={<i className='ri-eye-line' />}
                    >
                      Preview
                    </Button>
                  </>
                )}
              </Box>
              {metadata.thumbnail && !uploadingThumbnail && (
                <Box sx={{ mt: 2, maxWidth: 200 }}>
                  <img
                    src={metadata.thumbnail}
                    alt='Thumbnail preview'
                    style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </Box>
              )}
              {uploadingThumbnail && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                    Uploading to Cloudinary...
                  </Typography>
                </Box>
              )}
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                Upload thumbnail image for the content
              </Typography>
            </Box>
          </Grid>

          {/* Banner Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Banner Image
              </Typography>
              <input
                type='file'
                accept='image/*'
                onChange={onBannerUpload}
                style={{ display: 'none' }}
                id='banner-upload-input'
                disabled={uploadingBanner}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label htmlFor='banner-upload-input'>
                  <Button
                    variant='outlined'
                    component='span'
                    startIcon={
                      uploadingBanner ? (
                        <i className='ri-loader-4-line animate-spin' />
                      ) : (
                        <i className='ri-image-add-line' />
                      )
                    }
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? 'Uploading...' : 'Choose Banner'}
                  </Button>
                </label>
                {metadata.banner && !uploadingBanner && (
                  <>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      onClick={() => setMetadata({ ...metadata, banner: '' })}
                      startIcon={<i className='ri-delete-bin-line' />}
                    >
                      Remove
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => window.open(metadata.banner, '_blank')}
                      startIcon={<i className='ri-eye-line' />}
                    >
                      Preview
                    </Button>
                  </>
                )}
              </Box>
              {metadata.banner && !uploadingBanner && (
                <Box sx={{ mt: 2, maxWidth: 400 }}>
                  <img
                    src={metadata.banner}
                    alt='Banner preview'
                    style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </Box>
              )}
              {uploadingBanner && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                    Uploading to Cloudinary...
                  </Typography>
                </Box>
              )}
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                Upload banner image for the content
              </Typography>
            </Box>
          </Grid>

          {/* Trailer URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Trailer URL'
              value={metadata.trailer}
              onChange={e => setMetadata({ ...metadata, trailer: e.target.value })}
              placeholder='https://example.com/trailer.mp4'
              helperText='URL to the content trailer video'
            />
          </Grid>

          {/* Categories */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={option => option.categoryName}
              value={metadata.categories}
              onChange={(event, newValue) => {
                setMetadata({
                  ...metadata,
                  categories: newValue.map(v => ({ id: v.id, categoryName: v.categoryName }))
                })
              }}
              renderInput={params => <TextField {...params} label='Categories' placeholder='Search categories...' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.categoryName} size='small' />
                ))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loading}
              loadingText='Loading categories...'
              noOptionsText='No categories found'
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={option => option.tagName}
              value={metadata.tags}
              onChange={(event, newValue) => {
                setMetadata({
                  ...metadata,
                  tags: newValue.map(v => ({ id: v.id, tagName: v.tagName }))
                })
              }}
              renderInput={params => <TextField {...params} label='Tags' placeholder='Search tags...' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.tagName} size='small' />
                ))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loading}
              loadingText='Loading tags...'
              noOptionsText='No tags found'
            />
          </Grid>

          {/* Actors */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={actors}
              getOptionLabel={option => option.name}
              value={metadata.actors}
              onChange={(event, newValue) => {
                setMetadata({
                  ...metadata,
                  actors: newValue.map(v => ({ id: v.id, name: v.name }))
                })
              }}
              renderInput={params => <TextField {...params} label='Actors' placeholder='Search actors...' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.name} size='small' />
                ))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loading}
              loadingText='Loading actors...'
              noOptionsText='No actors found'
            />
          </Grid>

          {/* Directors */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={directors}
              getOptionLabel={option => option.name}
              value={metadata.directors}
              onChange={(event, newValue) => {
                setMetadata({
                  ...metadata,
                  directors: newValue.map(v => ({ id: v.id, name: v.name }))
                })
              }}
              renderInput={params => <TextField {...params} label='Directors' placeholder='Search directors...' />}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option.id} label={option.name} size='small' />
                ))
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loading}
              loadingText='Loading directors...'
              noOptionsText='No directors found'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MetadataForm
