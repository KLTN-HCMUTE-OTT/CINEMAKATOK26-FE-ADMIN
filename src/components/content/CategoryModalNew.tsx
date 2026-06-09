'use client'

import { useState, useEffect } from 'react'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress
} from '@mui/material'

import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/services'

interface CategoryModalNewProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>
  category?: Category | null
  mode: 'create' | 'edit'
}

const CategoryModalNew = ({ open, onClose, onSave, category, mode }: CategoryModalNewProps) => {
  const [categoryName, setCategoryName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && category) {
        setCategoryName(category.categoryName)
      } else {
        setCategoryName('')
      }

      setError('')
    }
  }, [open, category, mode])

  const handleSubmit = async () => {
    // Validation
    if (!categoryName.trim()) {
      setError('Category name is required')
      
return
    }

    try {
      setSubmitting(true)
      setError('')

      if (mode === 'create') {
        await onSave({ categoryName: categoryName.trim() })
      } else if (category) {
        await onSave({
          id: category.id,
          categoryName: categoryName.trim()
        })
      }

      // Close modal on success
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setCategoryName('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Category' : 'Edit Category'}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label='Category Name'
            value={categoryName}
            onChange={e => {
              setCategoryName(e.target.value)
              setError('')
            }}
            error={!!error}
            helperText={error}
            disabled={submitting}
            autoFocus
            placeholder='Enter category name (e.g., Action, Drama, Comedy)'
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={submitting} color='secondary'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' disabled={submitting}>
          {submitting ? <CircularProgress size={24} /> : mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CategoryModalNew
