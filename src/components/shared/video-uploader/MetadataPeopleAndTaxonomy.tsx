import { Grid, TextField, Chip, Autocomplete, FormHelperText } from '@mui/material'

import type { VideoMetadata, MetadataErrors } from './types'

interface MetadataPeopleAndTaxonomyProps {
  metadata: VideoMetadata
  categories: any[]
  tags: any[]
  actors: any[]
  directors: any[]
  loading: boolean
  errors?: MetadataErrors
  onMetadataChange: (metadata: VideoMetadata) => void
}

const MetadataPeopleAndTaxonomy = ({
  metadata,
  categories,
  tags,
  actors,
  directors,
  loading,
  errors = {},
  onMetadataChange
}: MetadataPeopleAndTaxonomyProps) => {
  const setMetadata = onMetadataChange

  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={categories}
          getOptionLabel={option => option.categoryName}
          value={metadata.categories}
          onChange={(_event, newValue) => {
            setMetadata({ ...metadata, categories: newValue.map(v => ({ id: v.id, categoryName: v.categoryName })) })
          }}
          renderInput={params => (
            <TextField
              {...params}
              label='Categories'
              placeholder='Search categories...'
              required
              error={!!errors.categories}
            />
          )}
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
        {errors.categories && <FormHelperText error sx={{ mx: '14px' }}>{errors.categories}</FormHelperText>}
      </Grid>

      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={tags}
          getOptionLabel={option => option.tagName}
          value={metadata.tags}
          onChange={(_event, newValue) => {
            setMetadata({ ...metadata, tags: newValue.map(v => ({ id: v.id, tagName: v.tagName })) })
          }}
          renderInput={params => (
            <TextField {...params} label='Tags' placeholder='Search tags...' required error={!!errors.tags} />
          )}
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
        {errors.tags && <FormHelperText error sx={{ mx: '14px' }}>{errors.tags}</FormHelperText>}
      </Grid>

      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={actors}
          getOptionLabel={option => option.name}
          value={metadata.actors}
          onChange={(_event, newValue) => {
            setMetadata({ ...metadata, actors: newValue.map(v => ({ id: v.id, name: v.name })) })
          }}
          renderInput={params => (
            <TextField {...params} label='Actors' placeholder='Search actors...' required error={!!errors.actors} />
          )}
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
        {errors.actors && <FormHelperText error sx={{ mx: '14px' }}>{errors.actors}</FormHelperText>}
      </Grid>

      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={directors}
          getOptionLabel={option => option.name}
          value={metadata.directors}
          onChange={(_event, newValue) => {
            setMetadata({ ...metadata, directors: newValue.map(v => ({ id: v.id, name: v.name })) })
          }}
          renderInput={params => (
            <TextField {...params} label='Directors' placeholder='Search directors...' required error={!!errors.directors} />
          )}
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
        {errors.directors && <FormHelperText error sx={{ mx: '14px' }}>{errors.directors}</FormHelperText>}
      </Grid>
    </>
  )
}

export default MetadataPeopleAndTaxonomy
