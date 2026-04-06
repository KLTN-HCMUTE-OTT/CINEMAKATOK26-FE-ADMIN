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
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox
} from '@mui/material'

interface UserEditDialogProps {
  open: boolean
  user: API.UserDetailDto | null
  loading: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<any>
}

const UserEditDialog = ({ open, user, loading, onClose, onSubmit }: UserEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    isAdmin: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        isAdmin: user.isAdmin || false
      })
    }
  }, [user, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const target = e.target as any
    const { name, value, type, checked } = target

    setFormData(prev => ({
      ...prev,
      [name as string]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      // Only send fields that have values
      const dataToSend: any = {}

      if (formData.name) dataToSend.name = formData.name
      if (formData.phoneNumber) dataToSend.phoneNumber = formData.phoneNumber
      if (formData.address) dataToSend.address = formData.address
      if (formData.dateOfBirth) dataToSend.dateOfBirth = formData.dateOfBirth
      if (formData.gender) dataToSend.gender = formData.gender
      // Always send email (current email) and isAdmin status
      dataToSend.email = user?.email
      dataToSend.isAdmin = formData.isAdmin

      const result = await onSubmit(dataToSend)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Failed to update user')
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Edit User Information</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              fullWidth
              size='small'
              disabled={submitting}
            />

            <TextField
              label='Phone Number'
              name='phoneNumber'
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              size='small'
              disabled={submitting}
            />

            <TextField
              label='Address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              fullWidth
              size='small'
              multiline
              rows={2}
              disabled={submitting}
            />

            <TextField
              label='Date of Birth'
              name='dateOfBirth'
              type='date'
              value={formData.dateOfBirth}
              onChange={handleChange}
              fullWidth
              size='small'
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth size='small' disabled={submitting}>
              <InputLabel>Gender</InputLabel>
              <Select
                name='gender'
                value={formData.gender}
                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                label='Gender'
              >
                <MenuItem value=''>None</MenuItem>
                <MenuItem value='MALE'>Male</MenuItem>
                <MenuItem value='FEMALE'>Female</MenuItem>
                <MenuItem value='OTHER'>Other</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox name='isAdmin' checked={formData.isAdmin} onChange={handleChange} disabled={submitting} />
              }
              label='Admin User'
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={submitting || !user} sx={{ minWidth: '100px' }}>
          {submitting ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserEditDialog
