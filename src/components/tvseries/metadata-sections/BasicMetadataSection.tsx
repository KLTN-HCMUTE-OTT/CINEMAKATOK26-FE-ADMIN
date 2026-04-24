import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Typography,
  CircularProgress
} from '@mui/material'

interface BasicMetadataSectionProps {
  metadata: any
  uploadingThumbnail: boolean
  uploadingBanner: boolean
  onChange: (field: string, value: any) => void
  onThumbnailUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBannerUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const BasicMetadataSection = ({
  metadata,
  uploadingThumbnail,
  uploadingBanner,
  onChange,
  onThumbnailUpload,
  onBannerUpload
}: BasicMetadataSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label='Series Title'
          placeholder='Enter TV series title'
          value={metadata.title}
          onChange={e => onChange('title', e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          multiline
          rows={4}
          label='Description'
          placeholder='Enter series description'
          value={metadata.description}
          onChange={e => onChange('description', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          type='date'
          label='Release Date'
          value={metadata.releaseDate}
          onChange={e => onChange('releaseDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth required>
          <InputLabel>Maturity Rating</InputLabel>
          <Select
            value={metadata.maturityRating}
            label='Maturity Rating'
            onChange={e => onChange('maturityRating', e.target.value)}
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
            <input type='file' hidden accept='image/*' onChange={onThumbnailUpload} />
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
            <input type='file' hidden accept='image/*' onChange={onBannerUpload} />
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

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Trailer URL'
          placeholder='https://www.youtube.com/watch?v=...'
          value={metadata.trailer}
          onChange={e => onChange('trailer', e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type='number'
          label='IMDB Rating'
          placeholder='0.0'
          value={metadata.imdbRating?.toString() ?? ''}
          onChange={e => {
            const value = e.target.value

            onChange('imdbRating', value === '' ? 0 : parseFloat(value))
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type='number'
          label='Average Rating'
          placeholder='0.0'
          value={metadata.avgRating?.toString() ?? ''}
          onChange={e => {
            const value = e.target.value

            onChange('avgRating', value === '' ? 0 : parseFloat(value))
          }}
        />
      </Grid>
    </>
  )
}

export default BasicMetadataSection
