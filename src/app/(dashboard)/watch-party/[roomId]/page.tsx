'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import { useWatchPartyAdminRoom } from '@/hooks/useWatchPartyAdminRoom'
import { useWatchPartyRoomStore } from '@/store/watchPartyRoomStore'
import { watchPartyControllerAdminCloseRoom } from '@/api/watchParty'
import { videosControllerGetVideoParentContent } from '@/api/videos'
import RoomMemberList from '@/components/dashboard/watch-party/RoomMemberList'
import ChatPanel from '@/components/dashboard/watch-party/ChatPanel'
import QueuePanel from '@/components/dashboard/watch-party/QueuePanel'
import SyncedVideoPlayer from '@/components/dashboard/watch-party/SyncedVideoPlayer'

// ── Main page ─────────────────────────────────────────────────────────────────

export default function WatchPartyRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()
  const [tab, setTab] = useState(0)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [closeReasonInput, setCloseReasonInput] = useState('')

  const actions = useWatchPartyAdminRoom(roomId)
  const { status, error, room, members, videoState, messages, queue, mutedUserIds, bannedUserIds, bannedMemberDetails, isClosed, closeReason, closeCustomReason, isKicked, currentVideoTitle } =
    useWatchPartyRoomStore()

  const [closedDialogDismissed, setClosedDialogDismissed] = useState(false)
  const [kickedDialogDismissed, setKickedDialogDismissed] = useState(false)
  const [parentContent, setParentContent] = useState<{ movieId?: string; tvSeriesId?: string } | null>(null)

  useEffect(() => {
    const vid = videoState?.videoId
    if (!vid) { setParentContent(null); return }
    videosControllerGetVideoParentContent({ id: vid })
      .then(res => setParentContent(res.data?.data ?? null))
      .catch(() => setParentContent(null))
  }, [videoState?.videoId])

  useEffect(() => {
    if ((isClosed && closedDialogDismissed) || (isKicked && kickedDialogDismissed)) {
      router.push('/watch-party')
    }
  }, [isClosed, isKicked, closedDialogDismissed, kickedDialogDismissed, router])

  const handleAdminCloseRoom = async () => {
    setClosing(true)
    try {
      await watchPartyControllerAdminCloseRoom({ id: roomId }, { reason: closeReasonInput.trim() || undefined })
    } catch { /* server will emit room:closed */ } finally {
      setClosing(false)
      setCloseConfirmOpen(false)
      setCloseReasonInput('')
    }
  }

  if (status === 'connecting') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error ?? 'Failed to connect to room'}
        </Alert>
        <Button variant='outlined' onClick={() => router.push('/watch-party')}>
          Back to Rooms
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h5' component='h1' sx={{ fontWeight: 600 }}>
            {room?.title ?? 'Loading…'}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {members.length} member{members.length !== 1 ? 's' : ''} · Room ID: {roomId}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            color='error'
            startIcon={<i className='ri-close-circle-line' />}
            onClick={() => setCloseConfirmOpen(true)}
            disabled={closing}
          >
            Close Room
          </Button>
          <Button
            variant='outlined'
            startIcon={<i className='ri-arrow-left-line' />}
            onClick={() => router.push('/watch-party')}
          >
            Back
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Content: video on left, panels on right */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
        {/* Left: video + playback controls */}
        <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <SyncedVideoPlayer
            videoState={videoState}
            onSync={({ isPlaying, currentTime }) => actions.syncVideo(isPlaying, currentTime)}
            onVideoEnd={actions.videoEnded}
            onPlayNext={actions.playNext}
          />
          {(currentVideoTitle || parentContent) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
              {currentVideoTitle && (
                <Typography variant='caption' color='text.secondary' noWrap sx={{ flex: 1 }}>
                  <i className='ri-film-line' style={{ marginRight: 4 }} />
                  {currentVideoTitle}
                </Typography>
              )}
              {!currentVideoTitle && <Box sx={{ flex: 1 }} />}
              {parentContent?.movieId && (
                <Tooltip title='View Movie page'>
                  <Button
                    size='small'
                    variant='outlined'
                    href={`/content/movies/${parentContent.movieId}`}
                    target='_blank'
                    sx={{ minWidth: 0, px: 1, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                    startIcon={<i className='ri-film-line' style={{ fontSize: 13 }} />}
                  >
                    View Movie
                  </Button>
                </Tooltip>
              )}
              {parentContent?.tvSeriesId && (
                <Tooltip title='View TV Series page'>
                  <Button
                    size='small'
                    variant='outlined'
                    href={`/content/tvseries/${parentContent.tvSeriesId}`}
                    target='_blank'
                    sx={{ minWidth: 0, px: 1, fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                    startIcon={<i className='ri-tv-line' style={{ fontSize: 13 }} />}
                  >
                    View TV Series
                  </Button>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>

        {/* Right: tabbed panels */}
        <Paper sx={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant='fullWidth' sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`Members (${members.length})`} />
            <Tab label='Chat' />
            <Tab label={`Queue (${queue.length})`} />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {tab === 0 && (
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                <RoomMemberList
                  members={members}
                  mutedUserIds={mutedUserIds}
                  bannedUserIds={bannedUserIds}
                  bannedMemberDetails={bannedMemberDetails}
                  onMute={actions.muteMember}
                  onUnmute={actions.unmuteMember}
                  onKick={actions.kickMember}
                  onBan={(userId, reason) => actions.banMember(userId, undefined, reason)}
                  onUnban={actions.unbanMember}
                />
              </Box>
            )}
            {tab === 1 && (
              <ChatPanel messages={messages} onSend={actions.sendMessage} />
            )}
            {tab === 2 && (
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                <QueuePanel
                  queue={queue}
                  onRemove={actions.removeFromQueue}
                  onPlayNow={(item) => actions.playNow(item)}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Room Closed dialog */}
      <Dialog open={isClosed && !closedDialogDismissed}>
        <DialogTitle>Room Closed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This watch party room has been closed.
            {closeCustomReason ? ` Reason: ${closeCustomReason}` : closeReason && closeReason !== 'admin_closed' ? ` (${closeReason})` : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => setClosedDialogDismissed(true)}>
            Back to Rooms
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kicked dialog */}
      <Dialog open={isKicked && !kickedDialogDismissed}>
        <DialogTitle>Removed from Room</DialogTitle>
        <DialogContent>
          <DialogContentText>You have been removed from this room.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => setKickedDialogDismissed(true)}>
            Back to Rooms
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin close room confirm */}
      <Dialog open={closeConfirmOpen} onClose={() => !closing && setCloseConfirmOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Close This Room?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will immediately close the room and disconnect all members. This action cannot be undone.
          </DialogContentText>
          <TextField
            label='Reason (optional)'
            fullWidth
            size='small'
            value={closeReasonInput}
            onChange={e => setCloseReasonInput(e.target.value)}
            inputProps={{ maxLength: 200 }}
            placeholder='e.g. Violation of community guidelines…'
            disabled={closing}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseConfirmOpen(false)} disabled={closing}>
            Cancel
          </Button>
          <Button variant='contained' color='error' onClick={handleAdminCloseRoom} disabled={closing}>
            {closing ? 'Closing…' : 'Close Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
