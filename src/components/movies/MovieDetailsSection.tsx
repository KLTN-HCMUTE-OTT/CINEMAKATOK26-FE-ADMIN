'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

interface MovieDetailsSectionProps {
  releaseDate: string
  duration: number
  imdbRating?: number
  avgRating?: number
  onReleaseDateChange: (value: string) => void
  onDurationChange: (value: number) => void
  onImdbRatingChange?: (value: number) => void
  onAvgRatingChange?: (value: number) => void
}

const MovieDetailsSection = ({
  releaseDate,
  duration,
  imdbRating = 0,
  avgRating = 0,
  onReleaseDateChange,
  onDurationChange,
  onImdbRatingChange,
  onAvgRatingChange
}: MovieDetailsSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom>
          Movie Details
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Release Date'
          type='date'
          value={releaseDate}
          onChange={e => onReleaseDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Duration (minutes)'
          type='number'
          value={duration}
          onChange={e => onDurationChange(Number(e.target.value))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='IMDb Rating'
          type='number'
          value={imdbRating}
          onChange={e => onImdbRatingChange?.(Number(e.target.value))}
          inputProps={{
            min: 0,
            max: 10,
            step: 0.1
          }}
          helperText='Rating from 0 to 10'
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Average Rating'
          type='number'
          value={avgRating}
          onChange={e => onAvgRatingChange?.(Number(e.target.value))}
          inputProps={{
            min: 0,
            max: 10,
            step: 0.1
          }}
          helperText='Rating from 0 to 10'
        />
      </Grid>
    </>
  )
}

export default MovieDetailsSection
