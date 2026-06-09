'use client'

import { useState } from 'react'

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material'

interface RoomDetailDialogProps {
  open: boolean
  roomDetail: API.WatchPartyRoomDetail | null
  userMap: Map<string, API.UserDto>
  loading: boolean
  onClose: () => void
  onKickMember: (member: API.WatchPartyMember) => void
  onBanUser: (userId: string, displayName?: string) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role='tabpanel' hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
)

const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
    <Typography variant='body2' color='text.secondary' sx={{ minWidth: 130 }}>
      {label}
    </Typography>
    <Box sx={{ textAlign: 'right' }}>{children}</Box>
  </Box>
)

const formatTimestamp = (epochMs: number) => {
  return new Date(epochMs).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const RoomDetailDialog = ({
  open,
  roomDetail,
  userMap,
  loading,
  onClose,
  onKickMember,
  onBanUser
}: RoomDetailDialogProps) => {
  const [tabValue, setTabValue] = useState(0)

  const getUserDisplay = (userId: string, fallbackDisplayName?: string) => {
    const user = userMap.get(userId)

    
return {
      name: user?.name ?? fallbackDisplayName ?? (userId ? `user-${userId.slice(0, 6)}` : 'Unknown'),
      avatar: user?.avatar
    }
  }

  const host = roomDetail ? getUserDisplay(roomDetail.hostId) : null

  const memberCount = roomDetail?.members?.length ?? 0
  const chatCount = roomDetail?.chatMessages?.length ?? 0
  const banCount = roomDetail?.moderation?.banList?.length ?? 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <i className='ri-tv-2-line' style={{ fontSize: 20, color: '#7367f0' }} />
          <Box>
            <Typography variant='h6'>{roomDetail?.title ?? 'Room Details'}</Typography>
            {roomDetail && (
              <Typography variant='caption' color='text.secondary'>
                {roomDetail.roomId}
              </Typography>
            )}
          </Box>
          {roomDetail && (
            <Chip
              label={roomDetail.isPublic ? 'Public' : 'Private'}
              size='small'
              color={roomDetail.isPublic ? 'success' : 'default'}
              variant='tonal'
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && !roomDetail ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label='Info' />
                <Tab label={`Members (${memberCount}/${roomDetail?.maxMembers ?? '?'})`} />
                <Tab label={`Chat (${chatCount})`} />
                <Tab label={`Moderation (${banCount})`} />
              </Tabs>
            </Box>

            {/* Tab 0: Info */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 3 }}>
                {roomDetail && (
                  <>
                    <InfoRow label='Host'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={host?.avatar} sx={{ width: 24, height: 24 }}>
                          {host?.name[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {host?.name}
                        </Typography>
                      </Box>
                    </InfoRow>
                    <Divider />
                    <InfoRow label='Video ID'>
                      <Tooltip title={roomDetail.videoId}>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {roomDetail.videoId}
                        </Typography>
                      </Tooltip>
                    </InfoRow>
                    <Divider />
                    <InfoRow label='Visibility'>
                      <Chip
                        label={roomDetail.isPublic ? 'Public' : 'Private'}
                        size='small'
                        color={roomDetail.isPublic ? 'success' : 'default'}
                        variant='tonal'
                      />
                    </InfoRow>
                    <Divider />
                    <InfoRow label='Password Protected'>
                      <Chip
                        label={roomDetail.requirePassword ? 'Yes' : 'No'}
                        size='small'
                        color={roomDetail.requirePassword ? 'warning' : 'default'}
                        variant='tonal'
                      />
                    </InfoRow>
                    {roomDetail.inviteCode && (
                      <>
                        <Divider />
                        <InfoRow label='Invite Code'>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {roomDetail.inviteCode}
                          </Typography>
                        </InfoRow>
                      </>
                    )}
                    <Divider />
                    <InfoRow label='Created At'>
                      <Typography variant='body2'>{formatTimestamp(roomDetail.createdAt)}</Typography>
                    </InfoRow>
                    {roomDetail.videoState && (
                      <>
                        <Divider />
                        <InfoRow label='Video State'>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={roomDetail.videoState.isPlaying ? 'Playing' : 'Paused'}
                              size='small'
                              color={roomDetail.videoState.isPlaying ? 'success' : 'default'}
                              variant='tonal'
                            />
                            <Typography variant='body2' color='text.secondary'>
                              {Math.floor(roomDetail.videoState.currentTime / 60)}m{' '}
                              {Math.floor(roomDetail.videoState.currentTime % 60)}s
                            </Typography>
                          </Box>
                        </InfoRow>
                      </>
                    )}
                  </>
                )}
              </Box>
            </TabPanel>

            {/* Tab 1: Members */}
            <TabPanel value={tabValue} index={1}>
              {memberCount === 0 ? (
                <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4, px: 3 }}>
                  No members
                </Typography>
              ) : (
                <List disablePadding sx={{ px: 1 }}>
                  {roomDetail?.members.map(member => {
                    const { name, avatar } = getUserDisplay(member.userId, member.displayName)

                    
return (
                      <ListItem
                        key={member.userId}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title='Kick member'>
                              <IconButton size='small' color='warning' onClick={() => onKickMember(member)}>
                                <i className='ri-user-unfollow-line' style={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Ban from Watch Party'>
                              <IconButton size='small' color='error' onClick={() => onBanUser(member.userId, name)}>
                                <i className='ri-forbid-line' style={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar src={avatar} alt={name} sx={{ width: 36, height: 36 }}>
                            {name[0]?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={name}
                          secondary={`Joined ${formatTimestamp(member.joinedAt)}`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </TabPanel>

            {/* Tab 2: Chat */}
            <TabPanel value={tabValue} index={2}>
              {chatCount === 0 ? (
                <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4, px: 3 }}>
                  No messages
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto', px: 3 }}>
                  {roomDetail?.chatMessages.map((msg, i) => {
                    const { name, avatar } = getUserDisplay(msg.userId)

                    
return (
                      <Box key={i} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                        <Avatar src={avatar} alt={name} sx={{ width: 30, height: 30, mt: 0.25 }}>
                          {name[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {formatTimestamp(msg.timestamp)}
                            </Typography>
                          </Box>
                          <Typography variant='body2' color='text.primary' sx={{ mt: 0.25 }}>
                            {msg.content}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              )}
            </TabPanel>

            {/* Tab 3: Moderation */}
            <TabPanel value={tabValue} index={3}>
              <Box sx={{ px: 3 }}>
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  Ban List ({roomDetail?.moderation?.banList?.length ?? 0})
                </Typography>
                {(roomDetail?.moderation?.banList?.length ?? 0) === 0 ? (
                  <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                    No banned users
                  </Typography>
                ) : (
                  <Table size='small' sx={{ mb: 3 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Banned Until</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomDetail?.moderation?.banList.map(entry => {
                        const { name, avatar } = getUserDisplay(entry.userId)

                        
return (
                          <TableRow key={entry.userId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={avatar} sx={{ width: 24, height: 24 }}>
                                  {name[0]?.toUpperCase()}
                                </Avatar>
                                <Typography variant='body2'>{name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2' color='text.secondary'>
                                {entry.reason ?? '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>
                                {entry.bannedUntil ? formatTimestamp(entry.bannedUntil) : 'Permanent'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}

                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  Mute List ({roomDetail?.moderation?.muteList?.length ?? 0})
                </Typography>
                {(roomDetail?.moderation?.muteList?.length ?? 0) === 0 ? (
                  <Typography variant='body2' color='text.secondary'>
                    No muted users
                  </Typography>
                ) : (
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Muted Until</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {roomDetail?.moderation?.muteList.map(entry => {
                        const { name, avatar } = getUserDisplay(entry.userId)

                        
return (
                          <TableRow key={entry.userId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={avatar} sx={{ width: 24, height: 24 }}>
                                  {name[0]?.toUpperCase()}
                                </Avatar>
                                <Typography variant='body2'>{name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2'>
                                {entry.mutedUntil ? formatTimestamp(entry.mutedUntil) : 'Permanent'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {roomDetail && (
          <Button
            variant='outlined'
            color='error'
            startIcon={<i className='ri-close-circle-line' />}
            onClick={() => onBanUser(roomDetail.hostId, host?.name)}
          >
            Ban Host
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default RoomDetailDialog
