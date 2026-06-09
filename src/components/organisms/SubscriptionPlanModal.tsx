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
  Switch,
  FormControlLabel,
  Typography,
  Box,
  IconButton
} from '@mui/material'

interface SubscriptionPlanModalProps {
  open: boolean
  onClose: () => void
  onSave: (planData: any) => void
  title?: string
  initialData?: any
}

const SubscriptionPlanModal = ({
  open,
  onClose,
  onSave,
  title = 'Add New Subscription Plan',
  initialData
}: SubscriptionPlanModalProps) => {
  const [planData, setPlanData] = useState({
    name: '',
    price: '',
    currency: 'USD',
    interval: 'month',
    features: [''],
    status: 'active'
  })

  useEffect(() => {
    if (initialData) {
      setPlanData({
        name: initialData.name,
        price: initialData.price.toString(),
        currency: initialData.currency,
        interval: initialData.interval,
        features: initialData.features || [''],
        status: initialData.status
      })
    }
  }, [initialData])

  const handleSave = () => {
    const processedData = {
      ...planData,
      price: parseFloat(planData.price) || 0,
      features: planData.features.filter(f => f.trim() !== '')
    }

    onSave(processedData)
    handleClose()
  }

  const handleClose = () => {
    setPlanData({
      name: '',
      price: '',
      currency: 'USD',
      interval: 'month',
      features: [''],
      status: 'active'
    })
    onClose()
  }

  const addFeatureField = () => {
    setPlanData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setPlanData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => (i === index ? value : feature))
    }))
  }

  const removeFeature = (index: number) => {
    setPlanData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Plan Name'
              value={planData.name}
              onChange={e => setPlanData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='number'
              label='Price'
              value={planData.price}
              onChange={e => setPlanData(prev => ({ ...prev, price: e.target.value }))}
              InputProps={{
                startAdornment: <span style={{ marginRight: 8 }}>$</span>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={planData.currency}
                label='Currency'
                onChange={e => setPlanData(prev => ({ ...prev, currency: e.target.value }))}
              >
                <MenuItem value='USD'>USD</MenuItem>
                <MenuItem value='EUR'>EUR</MenuItem>
                <MenuItem value='GBP'>GBP</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Billing Interval</InputLabel>
              <Select
                value={planData.interval}
                label='Billing Interval'
                onChange={e => setPlanData(prev => ({ ...prev, interval: e.target.value }))}
              >
                <MenuItem value='month'>Monthly</MenuItem>
                <MenuItem value='year'>Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='subtitle1' sx={{ mb: 2 }}>
              Features
            </Typography>
            {planData.features.map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Enter feature'
                  value={feature}
                  onChange={e => updateFeature(index, e.target.value)}
                />
                <IconButton
                  size='small'
                  color='error'
                  onClick={() => removeFeature(index)}
                  disabled={planData.features.length <= 1}
                >
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </Box>
            ))}
            <Button size='small' startIcon={<i className='ri-add-line' />} onClick={addFeatureField}>
              Add Feature
            </Button>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={planData.status === 'active'}
                  onChange={e =>
                    setPlanData(prev => ({
                      ...prev,
                      status: e.target.checked ? 'active' : 'draft'
                    }))
                  }
                />
              }
              label='Active Plan'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!planData.name}>
          {title.includes('Add') ? 'Add Plan' : 'Update Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubscriptionPlanModal
