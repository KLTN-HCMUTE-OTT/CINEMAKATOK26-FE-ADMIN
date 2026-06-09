'use client'

// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import { Grid, Typography, Box, Chip, Divider } from '@mui/material'

interface EpisodeAssetsProps {
  episodeData: {
    videoAssets: string[]
    subtitles: string[]
  }
  setEpisodeData: Dispatch<SetStateAction<any>>
}

const EpisodeAssets = ({ episodeData, setEpisodeData }: EpisodeAssetsProps) => {
  const videoQualityOptions = ['4K', '1080p', '720p', '480p', '360p']

  const subtitleLanguages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Italian',
    'Portuguese',
    'Japanese',
    'Korean',
    'Chinese'
  ]

  const handleVideoAssetToggle = (quality: string) => {
    setEpisodeData((prev: any) => ({
      ...prev,
      videoAssets: prev.videoAssets.includes(quality)
        ? prev.videoAssets.filter((q: string) => q !== quality)
        : [...prev.videoAssets, quality]
    }))
  }

  const handleSubtitleToggle = (language: string) => {
    setEpisodeData((prev: any) => ({
      ...prev,
      subtitles: prev.subtitles.includes(language)
        ? prev.subtitles.filter((l: string) => l !== language)
        : [...prev.subtitles, language]
    }))
  }

  return (
    <>
      {/* Video Assets */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant='h6' sx={{ mb: 2 }}>
          Video Assets & Subtitles
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>
          Available Video Qualities:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {videoQualityOptions.map(quality => (
            <Chip
              key={quality}
              label={quality}
              variant={episodeData.videoAssets.includes(quality) ? 'filled' : 'outlined'}
              color={episodeData.videoAssets.includes(quality) ? 'primary' : 'default'}
              onClick={() => handleVideoAssetToggle(quality)}
              clickable
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>
          Available Subtitles:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {subtitleLanguages.map(language => (
            <Chip
              key={language}
              label={language}
              variant={episodeData.subtitles.includes(language) ? 'filled' : 'outlined'}
              color={episodeData.subtitles.includes(language) ? 'secondary' : 'default'}
              onClick={() => handleSubtitleToggle(language)}
              clickable
            />
          ))}
        </Box>
      </Grid>
    </>
  )
}

export default EpisodeAssets
