'use client'

import { useState } from 'react'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography
} from '@mui/material'

interface KickMemberDialogProps {
  open: boolean
  roomId: string | null
  member: API.WatchPartyMember | null
  userMap: Map<string, API.UserDto>
  onClose: () => void
  onKick: (roomId: string, userId: string) => Promise<{ success: boolean; error?: string }>
  onBan: (userId: string, durationSec?: number, reason?: string) => Promise<{ success: boolean; error?: string }>
}

const KickMemberDialog = ({ open, roomId, member, userMap, onClose, onKick, onBan }: KickMemberDialogProps) => {
  const [alsoBan, setAlsoBan] = useState(false)
  const [banDurationDays, setBanDurationDays] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userInfo = member ? userMap.get(member.userId) : null
  const displayName = userInfo?.name ?? member?.displayName ?? `user-${member?.userId.slice(0, 6)}`
  const avatarUrl = userInfo?.avatar

  const handleClose = () => {
    if (!submitting) {
      setAlsoBan(false)
      setBanDurationDays(0)
      setError(null)
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!roomId || !member) return
    setError(null)
    setSubmitting(true)

    try {
      const kickResult = await onKick(roomId, member.userId)

      if (!kickResult.success) {
        setError(kickResult.error || 'Failed to kick member')
        
return
      }

      if (alsoBan) {
        const durationSec = banDurationDays > 0 ? banDurationDays * 86400 : undefined
        const banResult = await onBan(member.userId, durationSec)

        if (!banResult.success) {
          setError(banResult.error || 'Kicked but failed to ban user')
          
return
        }
      }

      handleClose()
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Kick Member</DialogTitle>

      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Avatar src={avatarUrl} alt={displayName} sx={{ width: 40, height: 40 }}>
            {displayName[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            {member && (
              <Typography variant='caption' color='text.secondary'>
                ID: {member.userId}
              </Typography>
            )}
          </Box>
        </Box>

        <FormControlLabel
          control={<Checkbox checked={alsoBan} onChange={e => setAlsoBan(e.target.checked)} disabled={submitting} />}
          label='Also ban this user from all Watch Parties'
        />

        {alsoBan && (
          <TextField
            label='Ban Duration (days)'
            type='number'
            value={banDurationDays}
            onChange={e => setBanDurationDays(parseInt(e.target.value) || 0)}
            fullWidth
            inputProps={{ min: 0 }}
            disabled={submitting}
            helperText='0 = Permanent ban'
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          color='warning'
          disabled={submitting || !member}
          sx={{ minWidth: 120 }}
        >
          {submitting ? <CircularProgress size={20} color='inherit' /> : alsoBan ? 'Kick & Ban' : 'Kick'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default KickMemberDialog
