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
import type { Tag, CreateTagDto, UpdateTagDto } from '@/libs/api/tag.api'

interface TagModalNewProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateTagDto | UpdateTagDto) => Promise<void>
  tag?: Tag | null
  mode: 'create' | 'edit'
}

const TagModalNew = ({ open, onClose, onSave, tag, mode }: TagModalNewProps) => {
  const [tagName, setTagName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset form when modal opens/closes or tag changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && tag) {
        setTagName(tag.tagName)
      } else {
        setTagName('')
      }
      setError('')
    }
  }, [open, tag, mode])

  const handleSubmit = async () => {
    // Validation
    if (!tagName.trim()) {
      setError('Tag name is required')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      if (mode === 'create') {
        await onSave({ tagName: tagName.trim() })
      } else if (tag) {
        await onSave({
          id: tag.id,
          tagName: tagName.trim()
        })
      }

      // Close modal on success
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save tag')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setTagName('')
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add New Tag' : 'Edit Tag'}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label='Tag Name'
            value={tagName}
            onChange={e => {
              setTagName(e.target.value)
              setError('')
            }}
            error={!!error}
            helperText={error}
            disabled={submitting}
            autoFocus
            placeholder='Enter tag name (e.g., trending, popular, new-release)'
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

export default TagModalNew
