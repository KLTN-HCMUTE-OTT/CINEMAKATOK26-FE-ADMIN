'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Typography,
  Box,
  Avatar
} from '@mui/material'

import { useSeason } from '@/features/content/tvseries/contexts/SeasonContext'

const SeasonModal = () => {
  const { modalOpen, selectedSeason, closeModal, saveSeason } = useSeason()

  const [seasonData, setSeasonData] = useState({
    title: '',
    description: '',
    releaseDate: '',
    status: 'draft',
    poster: ''
  })

  useEffect(() => {
    if (selectedSeason) {
      setSeasonData({
        title: selectedSeason.title || '',
        description: selectedSeason.description || '',
        releaseDate: selectedSeason.releaseDate || '',
        status: selectedSeason.status || 'draft',
        poster: selectedSeason.poster || ''
      })
    } else {
      setSeasonData({
        title: '',
        description: '',
        releaseDate: '',
        status: 'draft',
        poster: ''
      })
    }
  }, [selectedSeason])

  const handleSave = () => {
    if (!seasonData.title || !seasonData.description) {
      alert('Please fill in all required fields')

      return
    }

    saveSeason(seasonData)
    handleClose()
  }

  const handleClose = () => {
    setSeasonData({
      title: '',
      description: '',
      releaseDate: '',
      status: 'draft',
      poster: ''
    })
    closeModal()
  }

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'production', label: 'In Production' },
    { value: 'post_production', label: 'Post Production' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ]

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{selectedSeason ? 'Edit Season' : 'Add New Season'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Season Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Season Title'
              value={seasonData.title}
              onChange={e => setSeasonData(prev => ({ ...prev, title: e.target.value }))}
              placeholder='e.g., The Beginning, Season 1, Part I'
              required
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Season Description'
              value={seasonData.description}
              onChange={e => setSeasonData(prev => ({ ...prev, description: e.target.value }))}
              placeholder='Brief description of the season storyline and key plot points...'
              required
            />
          </Grid>

          {/* Release Date and Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='date'
              label='Release Date'
              value={seasonData.releaseDate}
              onChange={e => setSeasonData(prev => ({ ...prev, releaseDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={seasonData.status}
                label='Status'
                onChange={e => setSeasonData(prev => ({ ...prev, status: e.target.value }))}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Poster URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Poster Image URL'
              value={seasonData.poster}
              onChange={e => setSeasonData(prev => ({ ...prev, poster: e.target.value }))}
              placeholder='https://example.com/season-poster.jpg'
              helperText='Optional: URL to the season poster image'
            />
          </Grid>

          {/* Poster Preview */}
          {seasonData.poster && (
            <Grid item xs={12}>
              <Box>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Poster Preview:
                </Typography>
                <Avatar
                  src={seasonData.poster}
                  alt='Season Poster'
                  sx={{ width: 120, height: 160, borderRadius: 2 }}
                  variant='rounded'
                />
              </Box>
            </Grid>
          )}

          {/* Production Guidelines */}
          <Grid item xs={12}>
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Production Guidelines:
              </Typography>
              <Typography variant='body2' color='text.secondary' component='div'>
                <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                  <li>Season title should be descriptive and unique</li>
                  <li>Description should be 50-200 words summarizing the season arc</li>
                  <li>Release date helps with scheduling and promotion</li>
                  <li>Status tracks production progress and availability</li>
                  <li>Poster should be high quality (1080x1350px recommended)</li>
                </ul>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!seasonData.title || !seasonData.description}>
          {selectedSeason ? 'Update Season' : 'Add Season'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SeasonModal
