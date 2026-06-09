import { Grid, TextField, Autocomplete, Chip } from '@mui/material'

interface GenreSectionProps {
  metadata: any
  categories: API.CategoryDto[]
  tags: API.TagDto[]
  onChange: (field: string, value: any) => void
}

const GenreSection = ({ metadata, categories, tags, onChange }: GenreSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={categories}
          getOptionLabel={(option: API.CategoryDto) => option.categoryName}
          value={metadata.categories}
          onChange={(_, newValue) => onChange('categories', newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Categories *' placeholder='Select categories' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip {...getTagProps({ index })} key={option.id} label={option.categoryName} />
            ))
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={tags}
          getOptionLabel={(option: API.TagDto) => option.tagName}
          value={metadata.tags}
          onChange={(_, newValue) => onChange('tags', newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Tags' placeholder='Select tags' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.tagName} />)
          }
        />
      </Grid>
    </>
  )
}

export default GenreSection
