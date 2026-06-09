'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

interface CategoriesTagsSectionProps {
  categories: any[]
  tags: any[]
  selectedCategories: any[]
  selectedTags: any[]
  onCategoriesChange: (value: any[]) => void
  onTagsChange: (value: any[]) => void
}

const CategoriesTagsSection = ({
  categories,
  tags,
  selectedCategories,
  selectedTags,
  onCategoriesChange,
  onTagsChange
}: CategoriesTagsSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom>
          Categories & Tags
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Autocomplete
          multiple
          options={categories}
          getOptionLabel={option => option.categoryName}
          value={selectedCategories}
          onChange={(_, newValue) => onCategoriesChange(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Categories' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.categoryName} {...getTagProps({ index })} key={option.id} />
            ))
          }
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Autocomplete
          multiple
          options={tags}
          getOptionLabel={option => option.tagName}
          value={selectedTags}
          onChange={(_, newValue) => onTagsChange(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Tags' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={option.tagName} {...getTagProps({ index })} key={option.id} size='small' />
            ))
          }
        />
      </Grid>
    </>
  )
}

export default CategoriesTagsSection
