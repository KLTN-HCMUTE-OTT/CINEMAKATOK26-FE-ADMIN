'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { disconnectWatchPartySocket, getWatchPartySocket } from '../libs/watchPartySocket'
import { useWatchPartyRoomStore } from '../store/watchPartyRoomStore'
import type { ChatMessage, QueueItem, RoomMember, RoomState, VideoState } from '../types/watchPartyRoom'

const EVENTS = {
  ROOM_STATE: 'room:state',
  ROOM_MEMBER_JOINED: 'room:member-joined',
  ROOM_MEMBER_LEFT: 'room:member-left',
  ROOM_CLOSED: 'room:closed',
  ROOM_KICKED: 'room:kicked',
  ROOM_MEMBER_BANNED: 'room:member-banned',
  ROOM_MEMBER_UNBANNED: 'room:member-unbanned',
  ROOM_MEMBER_MUTED: 'room:member-muted',
  ROOM_MEMBER_UNMUTED: 'room:member-unmuted',
  VIDEO_SYNC_UPDATE: 'video:sync-update',
  VIDEO_CHANGED: 'video:changed',
  VIDEO_QUEUE_EMPTY: 'video:queue-empty',
  QUEUE_UPDATED: 'queue:updated',
  CHAT_NEW_MESSAGE: 'chat:new-message',
  ERROR: 'error',
} as const

export function useWatchPartyAdminRoom(roomId: string) {
  const store = useWatchPartyRoomStore()
  const socketRef = useRef<Socket | null>(null)
  const joinedRef = useRef(false)
  // Cache videoId → title as items flow through the queue
  const titleCacheRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    store.reset()
    store.setStatus('connecting')
    joinedRef.current = false

    let mounted = true

    getWatchPartySocket().then((socket) => {
      if (!mounted) return
      socketRef.current = socket

      const emitJoin = () => {
        socket.emit('room:join', { roomId })
        joinedRef.current = true
      }

      socket.on('connect', () => {
        if (mounted) emitJoin()
      })

      socket.on('reconnect', () => {
        if (mounted && joinedRef.current) emitJoin()
      })

      socket.on('connect_error', (err: Error) => {
        if (mounted) {
          store.setStatus('error')
          store.setError(err.message)
        }
      })

      socket.on(EVENTS.ROOM_STATE, (state: RoomState) => {
        if (!mounted) return
        state.queue.forEach((item) => titleCacheRef.current.set(item.videoId, item.title))
        store.setRoomState(state)
      })

      socket.on(EVENTS.ROOM_MEMBER_JOINED, ({ member }: { member: RoomMember }) => {
        if (mounted) store.addMember(member)
      })

      socket.on(EVENTS.ROOM_MEMBER_LEFT, ({ userId }: { userId: string }) => {
        if (mounted) store.removeMember(userId)
      })

      socket.on(EVENTS.ROOM_CLOSED, ({ reason, customReason }: { reason: string; customReason?: string }) => {
        if (mounted) store.setRoomClosed(reason, customReason)
      })

      socket.on(EVENTS.ROOM_KICKED, () => {
        if (mounted) store.setKicked()
      })

      socket.on(EVENTS.ROOM_MEMBER_MUTED, ({ userId }: { userId: string }) => {
        if (mounted) store.muteUser(userId)
      })

      socket.on(EVENTS.ROOM_MEMBER_UNMUTED, ({ userId }: { userId: string }) => {
        if (mounted) store.unmuteUser(userId)
      })

      socket.on(EVENTS.ROOM_MEMBER_BANNED, ({ userId }: { userId: string }) => {
        if (mounted) store.banUser(userId)
      })

      socket.on(EVENTS.ROOM_MEMBER_UNBANNED, ({ userId }: { userId: string }) => {
        if (mounted) store.unbanUser(userId)
      })

      socket.on(EVENTS.VIDEO_SYNC_UPDATE, (videoState: VideoState) => {
        if (mounted) store.updateVideoState(videoState)
      })

      socket.on(EVENTS.VIDEO_CHANGED, ({ videoState }: { videoState: VideoState }) => {
        if (!mounted) return
        store.updateVideoState(videoState)
        const title = titleCacheRef.current.get(videoState.videoId) ?? null
        store.setCurrentVideoTitle(title)
      })

      socket.on(EVENTS.VIDEO_QUEUE_EMPTY, () => {
        if (mounted) store.setCurrentVideoTitle(null)
      })

      socket.on(EVENTS.QUEUE_UPDATED, ({ queue }: { queue: QueueItem[] }) => {
        if (!mounted) return
        queue.forEach((item) => titleCacheRef.current.set(item.videoId, item.title))
        store.setQueue(queue)
      })

      socket.on(EVENTS.CHAT_NEW_MESSAGE, ({ message }: { message: ChatMessage }) => {
        if (mounted) store.addMessage(message)
      })

      socket.on(EVENTS.ERROR, (err: { code: string; message: string }) => {
        if (mounted) store.setError(`${err.code}: ${err.message}`)
      })

      if (socket.connected) emitJoin()
    }).catch((err: Error) => {
      if (mounted) {
        store.setStatus('error')
        store.setError(err.message)
      }
    })

    return () => {
      mounted = false
      const socket = socketRef.current
      if (socket) {
        socket.emit('room:leave')
        Object.values(EVENTS).forEach((ev) => socket.off(ev))
        socket.off('connect')
        socket.off('reconnect')
        socket.off('connect_error')
      }
      disconnectWatchPartySocket()
      store.reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const emit = useCallback(<T>(event: string, payload?: T) => {
    socketRef.current?.emit(event, payload)
  }, [])

  // ── Emit helpers ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback((text: string) => {
    emit('chat:message', { text })
  }, [emit])

  const syncVideo = useCallback((isPlaying: boolean, currentTime: number) => {
    emit('video:sync', { isPlaying, currentTime })
  }, [emit])

  const muteMember = useCallback((userId: string, durationSec?: number) => {
    emit('member:mute', { userId, durationSec })
  }, [emit])

  const unmuteMember = useCallback((userId: string) => {
    emit('member:unmute', { userId })
  }, [emit])

  const kickMember = useCallback((userId: string) => {
    emit('member:kick', { userId })
  }, [emit])

  const banMember = useCallback((userId: string, durationSec?: number, reason?: string) => {
    emit('member:ban', { userId, durationSec, reason })
  }, [emit])

  const unbanMember = useCallback((userId: string) => {
    emit('member:unban', { userId })
  }, [emit])

  const enqueueVideo = useCallback((item: Omit<QueueItem, 'addedBy' | 'addedAt'>) => {
    emit('queue:add', item)
  }, [emit])

  const removeFromQueue = useCallback((index: number) => {
    emit('queue:remove', { index })
  }, [emit])

  const reorderQueue = useCallback((from: number, to: number) => {
    emit('queue:reorder', { from, to })
  }, [emit])

  const playNow = useCallback((item: Omit<QueueItem, 'addedBy' | 'addedAt'>) => {
    emit('video:play-now', item)
  }, [emit])

  const playNext = useCallback(() => {
    emit('video:play-next')
  }, [emit])

  const videoEnded = useCallback((videoId: string) => {
    emit('video:end', { videoId })
  }, [emit])

  return {
    // state (read from store directly in components via useWatchPartyRoomStore)
    ...store,
    // emit helpers
    sendMessage,
    syncVideo,
    muteMember,
    unmuteMember,
    kickMember,
    banMember,
    unbanMember,
    enqueueVideo,
    removeFromQueue,
    reorderQueue,
    playNow,
    playNext,
    videoEnded,
  }
}
