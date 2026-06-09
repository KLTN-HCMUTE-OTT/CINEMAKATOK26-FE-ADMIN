import { Grid, TextField, Autocomplete, Chip } from '@mui/material'

interface CastSectionProps {
  metadata: any
  actors: API.ActorDto[]
  directors: API.DirectorDto[]
  onChange: (field: string, value: any) => void
}

const CastSection = ({ metadata, actors, directors, onChange }: CastSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={actors}
          getOptionLabel={(option: API.ActorDto) => option.name}
          value={metadata.actors}
          onChange={(_, newValue) => onChange('actors', newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Actors' placeholder='Select actors' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.name} />)
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={directors}
          getOptionLabel={(option: API.DirectorDto) => option.name}
          value={metadata.directors}
          onChange={(_, newValue) => onChange('directors', newValue)}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => <TextField {...params} label='Directors' placeholder='Select directors' />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.name} />)
          }
        />
      </Grid>
    </>
  )
}

export default CastSection
