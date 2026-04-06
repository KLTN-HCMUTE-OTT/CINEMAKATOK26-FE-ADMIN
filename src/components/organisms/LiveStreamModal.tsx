'use client'

// React Imports
import { useState } from 'react'

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
  Switch,
  FormControlLabel
} from '@mui/material'

interface LiveStreamModalProps {
  open: boolean
  onClose: () => void
  onSave: (streamData: any) => void
  title?: string
}

const LiveStreamModal = ({ open, onClose, onSave, title = 'Create New Live Stream' }: LiveStreamModalProps) => {
  const [streamData, setStreamData] = useState({
    title: '',
    streamer: '',
    quality: '1080p',
    server: 'US-East-1',
    autoStart: false,
    scheduledTime: ''
  })

  const handleSave = () => {
    onSave(streamData)
    handleClose()
  }

  const handleClose = () => {
    setStreamData({
      title: '',
      streamer: '',
      quality: '1080p',
      server: 'US-East-1',
      autoStart: false,
      scheduledTime: ''
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Stream Title'
              value={streamData.title}
              onChange={e => setStreamData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Streamer/Channel'
              value={streamData.streamer}
              onChange={e => setStreamData(prev => ({ ...prev, streamer: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Quality</InputLabel>
              <Select
                value={streamData.quality}
                label='Quality'
                onChange={e => setStreamData(prev => ({ ...prev, quality: e.target.value }))}
              >
                <MenuItem value='4K'>4K (2160p)</MenuItem>
                <MenuItem value='1080p'>Full HD (1080p)</MenuItem>
                <MenuItem value='720p'>HD (720p)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Server Region</InputLabel>
              <Select
                value={streamData.server}
                label='Server Region'
                onChange={e => setStreamData(prev => ({ ...prev, server: e.target.value }))}
              >
                <MenuItem value='US-East-1'>US East (Virginia)</MenuItem>
                <MenuItem value='US-West-1'>US West (California)</MenuItem>
                <MenuItem value='EU-West-1'>EU West (Ireland)</MenuItem>
                <MenuItem value='EU-Central-1'>EU Central (Frankfurt)</MenuItem>
                <MenuItem value='Asia-1'>Asia Pacific (Singapore)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='datetime-local'
              label='Scheduled Time'
              value={streamData.scheduledTime}
              onChange={e => setStreamData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={streamData.autoStart}
                  onChange={e => setStreamData(prev => ({ ...prev, autoStart: e.target.checked }))}
                />
              }
              label='Start stream immediately'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!streamData.title || !streamData.streamer}>
          Create Stream
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LiveStreamModal
