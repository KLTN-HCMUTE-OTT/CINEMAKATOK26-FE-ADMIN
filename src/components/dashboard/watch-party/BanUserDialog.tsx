'use client'

import { useState, useEffect } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material'

interface BanUserDialogProps {
  open: boolean
  userId?: string
  displayName?: string
  onClose: () => void
  onBan: (userId: string, durationSec?: number, reason?: string) => Promise<{ success: boolean; error?: string }>
  onUnban: (userId: string) => Promise<{ success: boolean; error?: string }>
}

const BanUserDialog = ({ open, userId, displayName, onClose, onBan, onUnban }: BanUserDialogProps) => {
  const [action, setAction] = useState<'ban' | 'unban'>('ban')
  const [inputUserId, setInputUserId] = useState(userId ?? '')
  const [durationDays, setDurationDays] = useState(0)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setInputUserId(userId ?? '')
      setAction('ban')
      setDurationDays(0)
      setReason('')
      setError(null)
    }
  }, [open, userId])

  const handleClose = () => {
    if (!submitting) onClose()
  }

  const handleSubmit = async () => {
    const targetUserId = inputUserId.trim()

    if (!targetUserId) {
      setError('User ID is required')
      
return
    }

    setError(null)
    setSubmitting(true)

    try {
      let result: { success: boolean; error?: string }

      if (action === 'ban') {
        const durationSec = durationDays > 0 ? durationDays * 86400 : undefined

        result = await onBan(targetUserId, durationSec, reason.trim() || undefined)
      } else {
        result = await onUnban(targetUserId)
      }

      if (result.success) {
        onClose()
      } else {
        setError(result.error || `Failed to ${action} user`)
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Manage Watch Party Ban</DialogTitle>

      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {error && (
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {displayName && (
          <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              User: <strong>{displayName}</strong>
            </Typography>
          </Box>
        )}

        <TextField
          label='User ID'
          value={inputUserId}
          onChange={e => setInputUserId(e.target.value)}
          fullWidth
          disabled={submitting || !!userId}
          size='small'
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            Action
          </Typography>
          <ToggleButtonGroup
            value={action}
            exclusive
            onChange={(_, newAction) => { if (newAction) setAction(newAction) }}
            fullWidth
            disabled={submitting}
          >
            <ToggleButton value='ban' sx={{ color: 'error.main' }}>
              Ban from Watch Party
            </ToggleButton>
            <ToggleButton value='unban' sx={{ color: 'success.main' }}>
              Unban
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {action === 'ban' && (
          <>
            <TextField
              label='Duration (days)'
              type='number'
              value={durationDays}
              onChange={e => setDurationDays(parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0 }}
              disabled={submitting}
              helperText='0 = Permanent ban'
              size='small'
            />
            <TextField
              label='Reason (optional)'
              value={reason}
              onChange={e => setReason(e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={submitting}
              size='small'
            />
            <Alert severity='warning'>
              Banned users cannot create or join any Watch Party rooms.
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color={action === 'ban' ? 'error' : 'success'}
          disabled={submitting}
          sx={{ minWidth: 120 }}
        >
          {submitting ? <CircularProgress size={20} color='inherit' /> : action === 'ban' ? 'Ban User' : 'Unban User'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BanUserDialog
