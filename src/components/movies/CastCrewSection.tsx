'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

interface CastCrewSectionProps {
  actors: any[]
  directors: any[]
  selectedActors: any[]
  selectedDirectors: any[]
  onActorsChange: (value: any[]) => void
  onDirectorsChange: (value: any[]) => void
}

const CastCrewSection = ({
  actors,
  directors,
  selectedActors,
  selectedDirectors,
  onActorsChange,
  onDirectorsChange
}: CastCrewSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom>
          Cast & Crew
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Autocomplete
          multiple
          options={actors}
          getOptionLabel={option => option.name}
          value={selectedActors}
          onChange={(_, newValue) => onActorsChange(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Actors' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} key={option.id} />)
          }
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Autocomplete
          multiple
          options={directors}
          getOptionLabel={option => option.name}
          value={selectedDirectors}
          onChange={(_, newValue) => onDirectorsChange(newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Directors' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} key={option.id} />)
          }
        />
      </Grid>
    </>
  )
}

export default CastCrewSection
