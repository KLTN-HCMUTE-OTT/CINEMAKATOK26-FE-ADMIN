'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Grid, TextField, Typography, Box, Avatar } from '@mui/material'

interface EpisodeThumbnailProps {
  episodeData: {
    thumbnail: string
  }
  setEpisodeData: Dispatch<SetStateAction<any>>
}

const EpisodeThumbnail = ({ episodeData, setEpisodeData }: EpisodeThumbnailProps) => {
  return (
    <>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Thumbnail URL'
          value={episodeData.thumbnail}
          onChange={e => setEpisodeData((prev: any) => ({ ...prev, thumbnail: e.target.value }))}
          placeholder='https://example.com/episode-thumbnail.jpg'
        />
      </Grid>

      {/* Thumbnail Preview */}
      {episodeData.thumbnail && (
        <Grid item xs={12}>
          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Thumbnail Preview:
            </Typography>
            <Avatar
              src={episodeData.thumbnail}
              alt='Episode Thumbnail'
              sx={{ width: 160, height: 90, borderRadius: 2 }}
              variant='rounded'
            />
          </Box>
        </Grid>
      )}
    </>
  )
}

export default EpisodeThumbnail
