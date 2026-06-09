import { Grid, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material'

import type { VideoMetadata, MetadataErrors } from './types'

interface MetadataBasicFieldsProps {
  metadata: VideoMetadata
  errors?: MetadataErrors
  onMetadataChange: (metadata: VideoMetadata) => void
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

const accessTierOptions = [
  { value: 'BASIC', label: 'Basic - Free users can watch' },
  { value: 'PREMIUM', label: 'Premium - Subscribers only' }
] as const

const MetadataBasicFields = ({ metadata, errors = {}, onMetadataChange }: MetadataBasicFieldsProps) => {
  const setMetadata = onMetadataChange

  return (
    <>
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

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Access Tier</InputLabel>
          <Select
            value={metadata.accessTier}
            label='Access Tier'
            onChange={e =>
              setMetadata({
                ...metadata,
                accessTier: e.target.value as 'BASIC' | 'PREMIUM'
              })
            }
          >
            {accessTierOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Title'
          value={metadata.title}
          onChange={e => setMetadata({ ...metadata, title: e.target.value })}
          required
          error={!!errors.title}
          helperText={errors.title}
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
          error={!!errors.description}
          helperText={errors.description}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Release Date'
          type='date'
          value={metadata.releaseDate}
          onChange={e => setMetadata({ ...metadata, releaseDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
          required
          error={!!errors.releaseDate}
          helperText={errors.releaseDate}
        />
      </Grid>

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

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Trailer URL'
          value={metadata.trailer}
          onChange={e => setMetadata({ ...metadata, trailer: e.target.value })}
          placeholder='https://example.com/trailer.mp4'
          required
          error={!!errors.trailer}
          helperText={errors.trailer ?? 'URL to the content trailer video'}
        />
      </Grid>
    </>
  )
}

export default MetadataBasicFields
