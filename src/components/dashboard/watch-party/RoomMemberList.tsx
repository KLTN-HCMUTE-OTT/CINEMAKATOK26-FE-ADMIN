'use client'

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { RoomMember } from '@/types/watchPartyRoom'
import type { BannedMemberDetail } from '@/store/watchPartyRoomStore'

const roleBadgeProps: Record<
  string,
  { label: string; color: 'warning' | 'info' | 'default' }
> = {
  host: { label: 'Host', color: 'warning' },
  admin: { label: 'Admin', color: 'info' },
  member: { label: 'Member', color: 'default' },
}

interface RoomMemberListProps {
  members: RoomMember[]
  mutedUserIds?: string[]
  bannedUserIds?: string[]
  bannedMemberDetails?: Record<string, BannedMemberDetail>
  currentUserId?: string
  onMute?: (userId: string) => void
  onUnmute?: (userId: string) => void
  onKick?: (userId: string) => void
  onBan?: (userId: string, reason?: string) => void
  onUnban?: (userId: string) => void
}

const MemberActions = ({
  member,
  isMuted,
  onMute,
  onUnmute,
  onKick,
  onBan,
}: {
  member: RoomMember
  isMuted: boolean
  onMute?: (userId: string) => void
  onUnmute?: (userId: string) => void
  onKick?: (userId: string) => void
  onBan?: (userId: string, reason?: string) => void
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')

  if (member.role === 'admin') return null

  const handleBanConfirm = () => {
    onBan?.(member.userId, banReason.trim() || undefined)
    setBanReason('')
    setBanDialogOpen(false)
  }

  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='ri-more-2-line' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {isMuted ? (
          <MenuItem onClick={() => { setAnchorEl(null); onUnmute?.(member.userId) }}>
            <i className='ri-volume-up-line' style={{ marginRight: 8 }} />
            Unmute
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { setAnchorEl(null); onMute?.(member.userId) }}>
            <i className='ri-volume-mute-line' style={{ marginRight: 8 }} />
            Mute
          </MenuItem>
        )}
        <MenuItem
          onClick={() => { setAnchorEl(null); onKick?.(member.userId) }}
          sx={{ color: 'warning.main' }}
        >
          <i className='ri-logout-box-r-line' style={{ marginRight: 8 }} />
          Kick
        </MenuItem>
        <MenuItem
          onClick={() => { setAnchorEl(null); setBanDialogOpen(true) }}
          sx={{ color: 'error.main' }}
        >
          <i className='ri-forbid-line' style={{ marginRight: 8 }} />
          Ban
        </MenuItem>
      </Menu>

      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Ban {member.displayName}?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label='Reason (optional)'
            fullWidth
            size='small'
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            inputProps={{ maxLength: 200 }}
            sx={{ mt: 1 }}
            placeholder='e.g. Spamming, inappropriate behaviour…'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleBanConfirm}>
            Ban
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const RoomMemberList = ({
  members,
  mutedUserIds = [],
  bannedUserIds = [],
  bannedMemberDetails = {},
  currentUserId,
  onMute,
  onUnmute,
  onKick,
  onBan,
  onUnban,
}: RoomMemberListProps) => {
  const sorted = [...members].sort((a, b) => {
    const order: Record<string, number> = { host: 0, admin: 1, member: 2 }
    return (order[a.role ?? 'member'] ?? 2) - (order[b.role ?? 'member'] ?? 2)
  })

  const bannedList = Object.values(bannedMemberDetails)

  if (sorted.length === 0 && bannedList.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color='text.secondary' variant='body2'>
          No members in room
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <List dense disablePadding>
        {sorted.map(member => {
          const role = member.role ?? 'member'
          const badge = roleBadgeProps[role] ?? roleBadgeProps.member
          const isMuted = mutedUserIds.includes(member.userId)
          const isCurrentUser = member.userId === currentUserId

          return (
            <ListItem
              key={member.userId}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: isCurrentUser ? 'action.selected' : undefined,
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={member.avatarUrl}
                  alt={member.displayName}
                  sx={{ width: 32, height: 32 }}
                >
                  {member.displayName[0]?.toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {member.displayName}
                      {isCurrentUser && (
                        <Typography
                          component='span'
                          variant='caption'
                          color='text.secondary'
                          sx={{ ml: 0.5 }}
                        >
                          (you)
                        </Typography>
                      )}
                    </Typography>
                    <Chip
                      label={badge.label}
                      color={badge.color}
                      size='small'
                      variant='tonal'
                      sx={{ fontSize: '0.6rem', height: 16, px: 0.5 }}
                    />
                    {isMuted && (
                      <Tooltip title='Muted'>
                        <i className='ri-volume-mute-fill' style={{ fontSize: 14, color: '#f59e0b' }} />
                      </Tooltip>
                    )}
                  </Box>
                }
              />
              {!isCurrentUser && role !== 'admin' && (
                <ListItemSecondaryAction>
                  <MemberActions
                    member={member}
                    isMuted={isMuted}
                    onMute={onMute}
                    onUnmute={onUnmute}
                    onKick={onKick}
                    onBan={onBan}
                  />
                </ListItemSecondaryAction>
              )}
            </ListItem>
          )
        })}
      </List>

      {bannedList.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 1, pb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <i className='ri-forbid-line' style={{ fontSize: 12, color: '#ef4444' }} />
            <Typography variant='caption' color='error' sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Banned ({bannedList.length})
            </Typography>
          </Box>
          <List dense disablePadding>
            {bannedList.map(banned => (
              <ListItem
                key={banned.userId}
                sx={{ borderRadius: 1, mb: 0.5, opacity: 0.6, '&:hover': { opacity: 1 } }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={banned.avatarUrl}
                    alt={banned.displayName}
                    sx={{ width: 32, height: 32, filter: 'grayscale(1)' }}
                  >
                    {banned.displayName[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant='body2' color='text.secondary'>
                      {banned.displayName}
                    </Typography>
                  }
                  secondary={
                    <Chip
                      label='Banned'
                      color='error'
                      size='small'
                      variant='tonal'
                      sx={{ fontSize: '0.6rem', height: 16, px: 0.5 }}
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title='Unban'>
                    <IconButton size='small' color='success' onClick={() => onUnban?.(banned.userId)}>
                      <i className='ri-lock-unlock-line' />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  )
}

export default RoomMemberList
