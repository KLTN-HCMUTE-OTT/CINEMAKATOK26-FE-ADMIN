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
  Typography,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'

interface UserBanDialogProps {
  open: boolean
  user: API.UserDetailDto | null
  loading: boolean
  onClose: () => void
  onBan: (reason: string, durationDays: number) => Promise<any>
  onUnban: () => Promise<any>
}

const UserBanDialog = ({ open, user, loading, onClose, onBan, onUnban }: UserBanDialogProps) => {
  const [action, setAction] = useState<'ban' | 'unban'>('ban')
  const [reason, setReason] = useState('')
  const [durationDays, setDurationDays] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // If user is already banned, default to unban action
      if (user.isBanned) {
        setAction('unban')
      } else {
        setAction('ban')
      }
    }
  }, [user, open])

  const handleSubmit = async () => {
    if (action === 'ban' && !reason.trim()) {
      setError('Please provide a ban reason')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      const result = action === 'ban' ? await onBan(reason, durationDays) : await onUnban()

      if (result.success) {
        setReason('')
        setDurationDays(0)
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
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Manage User Ban Status</DialogTitle>

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* User Info */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                User:{' '}
                <Box component='span' sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {user?.name}
                </Box>{' '}
                ({user?.email})
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                Current Status:{' '}
                <Box component='span' sx={{ fontWeight: 600, color: user?.isBanned ? 'error.main' : 'success.main' }}>
                  {user?.isBanned ? 'BANNED' : 'ACTIVE'}
                </Box>
              </Typography>
              {user?.isBanned && user?.banReason && (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Ban Reason:{' '}
                  <Box component='span' sx={{ fontWeight: 600 }}>
                    {user.banReason}
                  </Box>
                </Typography>
              )}
            </Box>

            {/* Action Toggle */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                Action
              </Typography>
              <ToggleButtonGroup
                value={action}
                exclusive
                onChange={(e, newAction) => {
                  if (newAction) setAction(newAction)
                }}
                fullWidth
                disabled={submitting}
              >
                <ToggleButton value='ban' sx={{ color: 'error.main' }}>
                  Ban User
                </ToggleButton>
                <ToggleButton value='unban' sx={{ color: 'success.main' }}>
                  Unban User
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Ban Reason (only show for ban action) */}
            {action === 'ban' && (
              <>
                <TextField
                  label='Ban Reason'
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder='Explain why this user is being banned...'
                  disabled={submitting}
                  helperText='This reason will be visible to moderators'
                />

                <TextField
                  label='Ban Duration (days)'
                  type='number'
                  value={durationDays}
                  onChange={e => setDurationDays(parseInt(e.target.value) || 0)}
                  fullWidth
                  inputProps={{ min: 0 }}
                  disabled={submitting}
                  helperText='0 = Permanent ban'
                />
              </>
            )}

            {/* Warning Message */}
            {action === 'ban' && (
              <Alert severity='warning'>
                This user will be unable to access their account and all content. This action can be reversed by
                unbanning the user.
              </Alert>
            )}

            {action === 'unban' && (
              <Alert severity='info'>This user will regain access to their account and all features.</Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color={action === 'ban' ? 'error' : 'success'}
          disabled={submitting || !user}
          sx={{ minWidth: '100px' }}
        >
          {submitting ? <CircularProgress size={24} /> : action === 'ban' ? 'Ban User' : 'Unban User'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserBanDialog
