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
  Typography
} from '@mui/material'

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  onSave: (categoryData: any) => void
  title?: string
  initialData?: any
  parentOptions?: any[]
}

const CategoryModal = ({
  open,
  onClose,
  onSave,
  title = 'Add New Category',
  initialData,
  parentOptions = []
}: CategoryModalProps) => {
  const [categoryData, setCategoryData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    featured: false,
    status: 'active'
  })

  useEffect(() => {
    if (initialData) {
      setCategoryData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        parentId: initialData.parentId || null,
        featured: initialData.featured || false,
        status: initialData.status || 'active'
      })
    }
  }, [initialData])

  const handleSave = () => {
    // Auto-generate slug from name if empty
    const slug =
      categoryData.slug ||
      categoryData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

    onSave({
      ...categoryData,
      slug
    })
    handleClose()
  }

  const handleClose = () => {
    setCategoryData({
      name: '',
      slug: '',
      description: '',
      parentId: null,
      featured: false,
      status: 'active'
    })
    onClose()
  }

  const handleNameChange = (name: string) => {
    setCategoryData(prev => ({
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Category Name'
              value={categoryData.name}
              onChange={e => handleNameChange(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Slug'
              value={categoryData.slug}
              onChange={e => setCategoryData(prev => ({ ...prev, slug: e.target.value }))}
              helperText='URL-friendly name (auto-generated from name)'
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Description'
              value={categoryData.description}
              onChange={e => setCategoryData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={categoryData.parentId || ''}
                label='Parent Category'
                onChange={e => setCategoryData(prev => ({ ...prev, parentId: e.target.value || null }))}
              >
                <MenuItem value=''>
                  <em>None (Main Category)</em>
                </MenuItem>
                {parentOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={categoryData.status}
                label='Status'
                onChange={e => setCategoryData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='draft'>Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={categoryData.featured}
                  onChange={e => setCategoryData(prev => ({ ...prev, featured: e.target.checked }))}
                />
              }
              label='Featured Category'
            />
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
              Featured categories will be prominently displayed on the homepage
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!categoryData.name}>
          {title.includes('Add') ? 'Add Category' : 'Update Category'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CategoryModal
