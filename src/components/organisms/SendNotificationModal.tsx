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
  Typography,
  Chip,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material'

interface SendNotificationModalProps {
  open: boolean
  onClose: () => void
  onSend: (notificationData: any) => void
  templates: any[]
}

const SendNotificationModal = ({ open, onClose, onSend, templates }: SendNotificationModalProps) => {
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'promotion',
    channels: ['push'],
    targetAudience: 'all_users',
    templateId: '',
    scheduledDate: '',
    sendImmediately: true
  })

  const handleSend = () => {
    const finalData = {
      ...notificationData,
      scheduledDate: notificationData.sendImmediately ? new Date().toISOString() : notificationData.scheduledDate
    }

    onSend(finalData)
    handleClose()
  }

  const handleClose = () => {
    setNotificationData({
      title: '',
      message: '',
      type: 'promotion',
      channels: ['push'],
      targetAudience: 'all_users',
      templateId: '',
      scheduledDate: '',
      sendImmediately: true
    })
    onClose()
  }

  const handleChannelToggle = (channel: string) => {
    setNotificationData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel) ? prev.channels.filter(c => c !== channel) : [...prev.channels, channel]
    }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId)

    if (template) {
      setNotificationData(prev => ({
        ...prev,
        templateId,
        title: template.subject.replace(/\{\{.*?\}\}/g, '[Variable]'),
        message: template.body.replace(/\{\{.*?\}\}/g, '[Variable]'),
        type: template.type
      }))
    }
  }

  const channelOptions = [
    { value: 'push', label: 'Push Notification', icon: 'ri-notification-line' },
    { value: 'email', label: 'Email', icon: 'ri-mail-line' },
    { value: 'sms', label: 'SMS', icon: 'ri-message-line' },
    { value: 'in_app', label: 'In-App', icon: 'ri-apps-line' }
  ]

  const audienceOptions = [
    { value: 'all_users', label: 'All Users' },
    { value: 'premium_users', label: 'Premium Subscribers' },
    { value: 'basic_users', label: 'Basic Subscribers' },
    { value: 'free_users', label: 'Free Users' },
    { value: 'new_users', label: 'New Users (Last 30 days)' },
    { value: 'inactive_users', label: 'Inactive Users' }
  ]

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>Send Notification</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Use Template (Optional)</InputLabel>
              <Select
                value={notificationData.templateId}
                label='Use Template (Optional)'
                onChange={e => handleTemplateSelect(e.target.value)}
              >
                <MenuItem value=''>
                  <em>Create from scratch</em>
                </MenuItem>
                {templates.map(template => (
                  <MenuItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Notification Title'
              value={notificationData.title}
              onChange={e => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Message'
              value={notificationData.message}
              onChange={e => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={notificationData.type}
                label='Type'
                onChange={e => setNotificationData(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value='content_update'>Content Update</MenuItem>
                <MenuItem value='promotion'>Promotion</MenuItem>
                <MenuItem value='billing'>Billing</MenuItem>
                <MenuItem value='system'>System</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={notificationData.targetAudience}
                label='Target Audience'
                onChange={e => setNotificationData(prev => ({ ...prev, targetAudience: e.target.value }))}
              >
                {audienceOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle2' sx={{ mb: 2 }}>
              Delivery Channels
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {channelOptions.map(channel => (
                <Chip
                  key={channel.value}
                  label={channel.label}
                  icon={<i className={channel.icon} />}
                  variant={notificationData.channels.includes(channel.value) ? 'filled' : 'outlined'}
                  color={notificationData.channels.includes(channel.value) ? 'primary' : 'default'}
                  onClick={() => handleChannelToggle(channel.value)}
                  clickable
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationData.sendImmediately}
                  onChange={e => setNotificationData(prev => ({ ...prev, sendImmediately: e.target.checked }))}
                />
              }
              label='Send Immediately'
            />
          </Grid>

          {!notificationData.sendImmediately && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='datetime-local'
                label='Schedule Date & Time'
                value={notificationData.scheduledDate}
                onChange={e => setNotificationData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSend}
          disabled={!notificationData.title || !notificationData.message || notificationData.channels.length === 0}
        >
          {notificationData.sendImmediately ? 'Send Now' : 'Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SendNotificationModal
