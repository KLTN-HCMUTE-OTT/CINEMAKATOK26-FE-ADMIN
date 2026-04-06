'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Grid, TextField, Typography } from '@mui/material'

interface EpisodeBasicInfoProps {
  episodeData: {
    title: string
    description: string
    duration: string
  }
  setEpisodeData: Dispatch<SetStateAction<any>>
}

const EpisodeBasicInfo = ({ episodeData, setEpisodeData }: EpisodeBasicInfoProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Basic Information
        </Typography>
      </Grid>

      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label='Episode Title'
          value={episodeData.title}
          onChange={e => setEpisodeData((prev: any) => ({ ...prev, title: e.target.value }))}
          placeholder='e.g., The Vanishing of Will Byers'
          required
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label='Duration (mm:ss)'
          value={episodeData.duration}
          onChange={e => setEpisodeData((prev: any) => ({ ...prev, duration: e.target.value }))}
          placeholder='e.g., 47:34'
          helperText='Format: minutes:seconds'
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label='Episode Description'
          value={episodeData.description}
          onChange={e => setEpisodeData((prev: any) => ({ ...prev, description: e.target.value }))}
          placeholder='Brief synopsis of the episode storyline and key events...'
          required
        />
      </Grid>
    </>
  )
}

export default EpisodeBasicInfo
