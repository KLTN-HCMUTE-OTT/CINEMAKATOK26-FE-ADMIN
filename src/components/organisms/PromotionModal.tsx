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
  InputAdornment
} from '@mui/material'

interface PromotionModalProps {
  open: boolean
  onClose: () => void
  onSave: (promotionData: any) => void
  title?: string
  initialData?: any
}

const PromotionModal = ({ open, onClose, onSave, title = 'Add New Promotion', initialData }: PromotionModalProps) => {
  const [promotionData, setPromotionData] = useState({
    name: '',
    type: 'discount',
    value: '',
    valueType: 'percentage',
    startDate: '',
    endDate: '',
    targetAudience: 'New Users',
    maxUsage: '',
    status: 'active'
  })

  useEffect(() => {
    if (initialData) {
      setPromotionData({
        name: initialData.name || '',
        type: initialData.type || 'discount',
        value: initialData.value?.toString() || '',
        valueType: initialData.valueType || 'percentage',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        targetAudience: initialData.targetAudience || 'New Users',
        maxUsage: initialData.maxUsage?.toString() || '',
        status: initialData.status || 'active'
      })
    }
  }, [initialData])

  const handleSave = () => {
    const processedData = {
      ...promotionData,
      value: parseFloat(promotionData.value) || 0,
      maxUsage: promotionData.maxUsage ? parseInt(promotionData.maxUsage) : null
    }

    onSave(processedData)
    handleClose()
  }

  const handleClose = () => {
    setPromotionData({
      name: '',
      type: 'discount',
      value: '',
      valueType: 'percentage',
      startDate: '',
      endDate: '',
      targetAudience: 'New Users',
      maxUsage: '',
      status: 'active'
    })
    onClose()
  }

  const promotionTypes = [
    { value: 'discount', label: 'Discount' },
    { value: 'free_trial', label: 'Free Trial' },
    { value: 'cashback', label: 'Cashback' },
    { value: 'upgrade', label: 'Free Upgrade' }
  ]

  const valueTypes = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' },
    { value: 'days', label: 'Days' }
  ]

  const audienceOptions = [
    'New Users',
    'All Users',
    'Premium Users',
    'Basic Users',
    'Inactive Users',
    'Returning Users'
  ]

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label='Promotion Name'
              value={promotionData.name}
              onChange={e => setPromotionData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Promotion Type</InputLabel>
              <Select
                value={promotionData.type}
                label='Promotion Type'
                onChange={e => setPromotionData(prev => ({ ...prev, type: e.target.value }))}
              >
                {promotionTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Value Type</InputLabel>
              <Select
                value={promotionData.valueType}
                label='Value Type'
                onChange={e => setPromotionData(prev => ({ ...prev, valueType: e.target.value }))}
              >
                {valueTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='number'
              label='Value'
              value={promotionData.value}
              onChange={e => setPromotionData(prev => ({ ...prev, value: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {promotionData.valueType === 'percentage'
                      ? '%'
                      : promotionData.valueType === 'fixed'
                        ? '$'
                        : 'days'}
                  </InputAdornment>
                )
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='number'
              label='Max Usage (Optional)'
              value={promotionData.maxUsage}
              onChange={e => setPromotionData(prev => ({ ...prev, maxUsage: e.target.value }))}
              helperText='Leave empty for unlimited usage'
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='date'
              label='Start Date'
              value={promotionData.startDate}
              onChange={e => setPromotionData(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='date'
              label='End Date'
              value={promotionData.endDate}
              onChange={e => setPromotionData(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={promotionData.targetAudience}
                label='Target Audience'
                onChange={e => setPromotionData(prev => ({ ...prev, targetAudience: e.target.value }))}
              >
                {audienceOptions.map(audience => (
                  <MenuItem key={audience} value={audience}>
                    {audience}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={promotionData.status === 'active'}
                  onChange={e =>
                    setPromotionData(prev => ({
                      ...prev,
                      status: e.target.checked ? 'active' : 'draft'
                    }))
                  }
                />
              }
              label='Active Promotion'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={!promotionData.name || !promotionData.value || !promotionData.startDate || !promotionData.endDate}
        >
          {title.includes('Add') ? 'Add Promotion' : 'Update Promotion'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PromotionModal
