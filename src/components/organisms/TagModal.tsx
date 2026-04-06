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
  Box
} from '@mui/material'

interface TagModalProps {
  open: boolean
  onClose: () => void
  onSave: (tagData: any) => void
  title?: string
  initialData?: any
}

const TagModal = ({ open, onClose, onSave, title = 'Add New Tag', initialData }: TagModalProps) => {
  const [tagData, setTagData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#1976d2',
    status: 'active'
  })

  useEffect(() => {
    if (initialData) {
      setTagData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        color: initialData.color || '#1976d2',
        status: initialData.status || 'active'
      })
    }
  }, [initialData])

  const handleSave = () => {
    // Auto-generate slug from name if empty
    const slug =
      tagData.slug ||
      tagData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    onSave({
      ...tagData,
      slug
    })
    handleClose()
  }

  const handleClose = () => {
    setTagData({
      name: '',
      slug: '',
      description: '',
      color: '#1976d2',
      status: 'active'
    })
    onClose()
  }

  const handleNameChange = (name: string) => {
    setTagData(prev => ({
      ...prev,
      name,

      // Auto-generate slug if it's empty or matches the previous name pattern
      slug:
        prev.slug === '' ||
        prev.slug ===
          prev.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
          ? name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')
          : prev.slug
    }))
  }

  const colorOptions = [
    { value: '#1976d2', label: 'Blue' },
    { value: '#2e7d32', label: 'Green' },
    { value: '#ed6c02', label: 'Orange' },
    { value: '#d32f2f', label: 'Red' },
    { value: '#9c27b0', label: 'Purple' },
    { value: '#0288d1', label: 'Cyan' },
    { value: '#f57c00', label: 'Amber' },
    { value: '#7b1fa2', label: 'Deep Purple' }
  ]

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Tag Name'
              value={tagData.name}
              onChange={e => handleNameChange(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Slug'
              value={tagData.slug}
              onChange={e => setTagData(prev => ({ ...prev, slug: e.target.value }))}
              helperText='URL-friendly name (auto-generated from name)'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Description'
              value={tagData.description}
              onChange={e => setTagData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={tagData.color}
                label='Color'
                onChange={e => setTagData(prev => ({ ...prev, color: e.target.value }))}
                renderValue={value => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: value,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <Typography>{colorOptions.find(c => c.value === value)?.label || 'Custom'}</Typography>
                  </Box>
                )}
              >
                {colorOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 1,
                          bgcolor: option.value,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Typography>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={tagData.status}
                label='Status'
                onChange={e => setTagData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='draft'>Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!tagData.name}>
          {title.includes('Add') ? 'Add Tag' : 'Update Tag'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TagModal
