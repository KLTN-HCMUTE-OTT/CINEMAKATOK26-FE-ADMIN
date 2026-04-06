'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid, TextField, Button, Switch, FormControlLabel, Divider, Typography, Alert } from '@mui/material'

interface GeneralSettingsData {
  platformName: string
  platformDescription: string
  supportEmail: string
  maxConcurrentStreams: string
  enableRegistration: boolean
  enableGuestAccess: boolean
  maintenanceMode: boolean
}

interface GeneralSettingsProps {
  initialData?: GeneralSettingsData
  onSave?: (data: GeneralSettingsData) => void
}

const GeneralSettings = ({ initialData, onSave }: GeneralSettingsProps) => {
  const [settings, setSettings] = useState<GeneralSettingsData>(
    initialData || {
      platformName: 'StreamAdmin',
      platformDescription: 'Modern OTT Streaming Platform',
      supportEmail: 'support@streamadmin.com',
      maxConcurrentStreams: '4',
      enableRegistration: true,
      enableGuestAccess: false,
      maintenanceMode: false
    }
  )

  const handleSave = () => {
    onSave?.(settings)
    console.log('Saving general settings:', settings)
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Platform Configuration
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Platform Name'
          value={settings.platformName}
          onChange={e => setSettings(prev => ({ ...prev, platformName: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Support Email'
          type='email'
          value={settings.supportEmail}
          onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label='Platform Description'
          value={settings.platformDescription}
          onChange={e => setSettings(prev => ({ ...prev, platformDescription: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type='number'
          label='Max Concurrent Streams'
          value={settings.maxConcurrentStreams}
          onChange={e => setSettings(prev => ({ ...prev, maxConcurrentStreams: e.target.value }))}
          helperText='Maximum streams per user account'
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant='h6' sx={{ mb: 2 }}>
          Access Control
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enableRegistration}
              onChange={e => setSettings(prev => ({ ...prev, enableRegistration: e.target.checked }))}
            />
          }
          label='Enable User Registration'
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enableGuestAccess}
              onChange={e => setSettings(prev => ({ ...prev, enableGuestAccess: e.target.checked }))}
            />
          }
          label='Enable Guest Access'
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.maintenanceMode}
              onChange={e => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
              color='warning'
            />
          }
          label='Maintenance Mode'
        />
        {settings.maintenanceMode && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            Platform is in maintenance mode. Only admin users can access the system.
          </Alert>
        )}
      </Grid>

      <Grid item xs={12}>
        <Button variant='contained' onClick={handleSave}>
          Save General Settings
        </Button>
      </Grid>
    </Grid>
  )
}

export default GeneralSettings
