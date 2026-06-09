'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid, Button, Switch, FormControlLabel, Divider, Typography } from '@mui/material'

interface NotificationSettingsData {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  systemAlerts: boolean
  weeklyReports: boolean
}

interface NotificationSettingsProps {
  initialData?: NotificationSettingsData
  onSave?: (data: NotificationSettingsData) => void
}

const NotificationSettings = ({ initialData, onSave }: NotificationSettingsProps) => {
  const [settings, setSettings] = useState<NotificationSettingsData>(
    initialData || {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      marketingEmails: true,
      systemAlerts: true,
      weeklyReports: true
    }
  )

  const handleSave = () => {
    onSave?.(settings)
    console.log('Saving notification settings:', settings)
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Notification Preferences
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={e => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
            />
          }
          label='Email Notifications'
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.pushNotifications}
              onChange={e => setSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
            />
          }
          label='Push Notifications'
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.smsNotifications}
              onChange={e => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
            />
          }
          label='SMS Notifications'
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant='h6' sx={{ mb: 2 }}>
          Email Types
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.marketingEmails}
              onChange={e => setSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
            />
          }
          label='Marketing Emails'
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.systemAlerts}
              onChange={e => setSettings(prev => ({ ...prev, systemAlerts: e.target.checked }))}
            />
          }
          label='System Alerts'
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.weeklyReports}
              onChange={e => setSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
            />
          }
          label='Weekly Reports'
        />
      </Grid>

      <Grid item xs={12}>
        <Button variant='contained' onClick={handleSave}>
          Save Notification Settings
        </Button>
      </Grid>
    </Grid>
  )
}

export default NotificationSettings
