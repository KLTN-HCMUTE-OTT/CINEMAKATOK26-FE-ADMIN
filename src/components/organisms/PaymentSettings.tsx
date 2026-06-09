'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography
} from '@mui/material'

interface PaymentSettingsData {
  currency: string
  taxRate: string
  enableStripe: boolean
  enablePaypal: boolean
  stripePublishableKey: string
  stripeSecretKey: string
  paypalClientId: string
  trialPeriodDays: string
}

interface PaymentSettingsProps {
  initialData?: PaymentSettingsData
  onSave?: (data: PaymentSettingsData) => void
}

const PaymentSettings = ({ initialData, onSave }: PaymentSettingsProps) => {
  const [settings, setSettings] = useState<PaymentSettingsData>(
    initialData || {
      currency: 'USD',
      taxRate: '8.5',
      enableStripe: true,
      enablePaypal: false,
      stripePublishableKey: 'pk_test_...',
      stripeSecretKey: '••••••••••••••••',
      paypalClientId: '',
      trialPeriodDays: '7'
    }
  )

  const handleSave = () => {
    onSave?.(settings)
    console.log('Saving payment settings:', settings)
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h6' sx={{ mb: 2 }}>
          Payment Configuration
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Currency</InputLabel>
          <Select
            value={settings.currency}
            label='Currency'
            onChange={e => setSettings(prev => ({ ...prev, currency: e.target.value }))}
          >
            <MenuItem value='USD'>USD - US Dollar</MenuItem>
            <MenuItem value='EUR'>EUR - Euro</MenuItem>
            <MenuItem value='GBP'>GBP - British Pound</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Tax Rate (%)'
          type='number'
          value={settings.taxRate}
          onChange={e => setSettings(prev => ({ ...prev, taxRate: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type='number'
          label='Free Trial Period (Days)'
          value={settings.trialPeriodDays}
          onChange={e => setSettings(prev => ({ ...prev, trialPeriodDays: e.target.value }))}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant='h6' sx={{ mb: 2 }}>
          Payment Providers
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enableStripe}
              onChange={e => setSettings(prev => ({ ...prev, enableStripe: e.target.checked }))}
            />
          }
          label='Enable Stripe'
        />
      </Grid>

      {settings.enableStripe && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Stripe Publishable Key'
              value={settings.stripePublishableKey}
              onChange={e => setSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='password'
              label='Stripe Secret Key'
              value={settings.stripeSecretKey}
              onChange={e => setSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
            />
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.enablePaypal}
              onChange={e => setSettings(prev => ({ ...prev, enablePaypal: e.target.checked }))}
            />
          }
          label='Enable PayPal'
        />
      </Grid>

      {settings.enablePaypal && (
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label='PayPal Client ID'
            value={settings.paypalClientId}
            onChange={e => setSettings(prev => ({ ...prev, paypalClientId: e.target.value }))}
          />
        </Grid>
      )}

      <Grid item xs={12}>
        <Button variant='contained' onClick={handleSave}>
          Save Payment Settings
        </Button>
      </Grid>
    </Grid>
  )
}

export default PaymentSettings
