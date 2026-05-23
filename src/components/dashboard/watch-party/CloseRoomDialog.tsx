'use client'

import { useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from '@mui/material'

interface CloseRoomDialogProps {
  open: boolean
  room: API.RoomListItemDto | null
  onClose: () => void
  onConfirm: (roomId: string, reason?: string) => Promise<{ success: boolean; error?: string }>
}

const CloseRoomDialog = ({ open, room, onClose, onConfirm }: CloseRoomDialogProps) => {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (!submitting) {
      setReason('')
      setError(null)
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!room) return
    setError(null)
    setSubmitting(true)
    try {
      const result = await onConfirm(room.roomId, reason.trim() || undefined)
      if (result.success) {
        setReason('')
        onClose()
      } else {
        setError(result.error || 'Failed to close room')
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Force Close Room</DialogTitle>

      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Alert severity='error'>
          <Typography variant='body2'>
            This will disconnect all{' '}
            <strong>{room?.memberCount ?? 0} member{(room?.memberCount ?? 0) !== 1 ? 's' : ''}</strong> currently
            watching in <strong>"{room?.title}"</strong>. This action cannot be undone.
          </Typography>
        </Alert>

        <TextField
          label='Reason (optional)'
          value={reason}
          onChange={e => setReason(e.target.value)}
          fullWidth
          multiline
          rows={2}
          placeholder='Explain why this room is being closed...'
          disabled={submitting}
          helperText='This reason will be recorded in the audit log'
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='error'
          disabled={submitting || !room}
          sx={{ minWidth: 120 }}
        >
          {submitting ? <CircularProgress size={20} color='inherit' /> : 'Force Close'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CloseRoomDialog
