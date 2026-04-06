'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Button } from '@mui/material'

// Components Imports
import EpisodeBasicInfo from '@components/molecules/EpisodeBasicInfo'
import EpisodeDetails from '@components/molecules/EpisodeDetails'
import EpisodeThumbnail from '@components/molecules/EpisodeThumbnail'
import EpisodeAssets from '@components/molecules/EpisodeAssets'
import ProductionGuidelines from '@components/molecules/ProductionGuidelines'

interface EpisodeModalProps {
  open: boolean
  onClose: () => void
  onSave: (episodeData: any) => void
  episode?: any
  title?: string
}

const EpisodeModal = ({ open, onClose, onSave, episode, title = 'Add New Episode' }: EpisodeModalProps) => {
  const [episodeData, setEpisodeData] = useState({
    title: '',
    description: '',
    season: 1,
    episodeNumber: 1,
    duration: '',
    releaseDate: '',
    status: 'draft',
    thumbnail: '',
    videoAssets: [] as string[],
    subtitles: [] as string[]
  })

  useEffect(() => {
    if (episode) {
      setEpisodeData({
        title: episode.title || '',
        description: episode.description || '',
        season: episode.season || 1,
        episodeNumber: episode.episodeNumber || 1,
        duration: episode.duration || '',
        releaseDate: episode.releaseDate || '',
        status: episode.status || 'draft',
        thumbnail: episode.thumbnail || '',
        videoAssets: episode.videoAssets || [],
        subtitles: episode.subtitles || []
      })
    } else {
      setEpisodeData({
        title: '',
        description: '',
        season: 1,
        episodeNumber: 1,
        duration: '',
        releaseDate: '',
        status: 'draft',
        thumbnail: '',
        videoAssets: [],
        subtitles: []
      })
    }
  }, [episode])

  const handleSave = () => {
    if (!episodeData.title || !episodeData.description) {
      alert('Please fill in all required fields')

      return
    }

    onSave(episodeData)
    handleClose()
  }

  const handleClose = () => {
    setEpisodeData({
      title: '',
      description: '',
      season: 1,
      episodeNumber: 1,
      duration: '',
      releaseDate: '',
      status: 'draft',
      thumbnail: '',
      videoAssets: [],
      subtitles: []
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <EpisodeBasicInfo episodeData={episodeData} setEpisodeData={setEpisodeData} />

          {/* Episode Details */}
          <EpisodeDetails episodeData={episodeData} setEpisodeData={setEpisodeData} />

          {/* Thumbnail */}
          <EpisodeThumbnail episodeData={episodeData} setEpisodeData={setEpisodeData} />

          {/* Video Assets & Subtitles */}
          <EpisodeAssets episodeData={episodeData} setEpisodeData={setEpisodeData} />

          {/* Production Guidelines */}
          <ProductionGuidelines />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!episodeData.title || !episodeData.description}>
          {title.includes('Add') ? 'Add Episode' : 'Update Episode'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EpisodeModal
