'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

interface BasicInfoSectionProps {
  title: string
  description: string
  type: 'MOVIE' | 'TV_SERIES'
  maturityRating: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onTypeChange: (value: 'MOVIE' | 'TV_SERIES') => void
  onMaturityRatingChange: (value: string) => void
}

const BasicInfoSection = ({
  title,
  description,
  type,
  maturityRating,
  onTitleChange,
  onDescriptionChange,
  onTypeChange,
  onMaturityRatingChange
}: BasicInfoSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom>
          Basic Information
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField fullWidth label='Title' value={title} onChange={e => onTitleChange(e.target.value)} required />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label='Description'
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          multiline
          rows={4}
          required
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select value={type} onChange={e => onTypeChange(e.target.value as any)} label='Type'>
            <MenuItem value='MOVIE'>Movie</MenuItem>
            <MenuItem value='TV_SERIES'>TV Series</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Maturity Rating</InputLabel>
          <Select value={maturityRating} onChange={e => onMaturityRatingChange(e.target.value)} label='Maturity Rating'>
            <MenuItem value='G'>G</MenuItem>
            <MenuItem value='PG'>PG</MenuItem>
            <MenuItem value='PG-13'>PG-13</MenuItem>
            <MenuItem value='R'>R</MenuItem>
            <MenuItem value='NC-17'>NC-17</MenuItem>
            <MenuItem value='TV-Y'>TV-Y</MenuItem>
            <MenuItem value='TV-PG'>TV-PG</MenuItem>
            <MenuItem value='TV-14'>TV-14</MenuItem>
            <MenuItem value='TV-MA'>TV-MA</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}

export default BasicInfoSection
