'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Divider } from '@mui/material'

interface EpisodeDetailsProps {
  episodeData: {
    season: number
    episodeNumber: number
    status: string
    releaseDate: string
  }
  setEpisodeData: Dispatch<SetStateAction<any>>
}

const EpisodeDetails = ({ episodeData, setEpisodeData }: EpisodeDetailsProps) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'script', label: 'Script Writing' },
    { value: 'pre_production', label: 'Pre-Production' },
    { value: 'filming', label: 'Filming' },
    { value: 'post_production', label: 'Post-Production' },
    { value: 'review', label: 'Under Review' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ]

  const seasonOptions = [
    { value: 1, label: 'Season 1' },
    { value: 2, label: 'Season 2' },
    { value: 3, label: 'Season 3' },
    { value: 4, label: 'Season 4' },
    { value: 5, label: 'Season 5' }
  ]

  return (
    <>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant='h6' sx={{ mb: 2 }}>
          Episode Details
        </Typography>
      </Grid>

      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Season</InputLabel>
          <Select
            value={episodeData.season}
            label='Season'
            onChange={e => setEpisodeData((prev: any) => ({ ...prev, season: Number(e.target.value) }))}
          >
            {seasonOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          type='number'
          label='Episode Number'
          value={episodeData.episodeNumber}
          onChange={e => setEpisodeData((prev: any) => ({ ...prev, episodeNumber: Number(e.target.value) }))}
          inputProps={{ min: 1 }}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={episodeData.status}
            label='Status'
            onChange={e => setEpisodeData((prev: any) => ({ ...prev, status: e.target.value }))}
          >
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type='date'
          label='Release Date'
          value={episodeData.releaseDate}
          onChange={e => setEpisodeData((prev: any) => ({ ...prev, releaseDate: e.target.value }))}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
    </>
  )
}

export default EpisodeDetails
