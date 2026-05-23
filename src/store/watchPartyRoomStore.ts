import { create } from 'zustand'
import type { ChatMessage, QueueItem, RoomMember, RoomState, RoomSummary, VideoState } from '../types/watchPartyRoom'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface BannedMemberDetail {
  userId: string
  displayName: string
  avatarUrl?: string
}

interface WatchPartyRoomState {
  status: ConnectionStatus
  error: string | null
  room: RoomSummary | null
  members: RoomMember[]
  videoState: VideoState | null
  messages: ChatMessage[]
  queue: QueueItem[]
  mutedUserIds: string[]
  bannedUserIds: string[]
  bannedMemberDetails: Record<string, BannedMemberDetail>
  isClosed: boolean
  closeReason: string | null
  closeCustomReason: string | null
  isKicked: boolean
  currentVideoTitle: string | null

  setStatus: (status: ConnectionStatus) => void
  setCurrentVideoTitle: (title: string | null) => void
  setError: (error: string | null) => void
  setRoomState: (state: RoomState) => void
  addMember: (member: RoomMember) => void
  removeMember: (userId: string) => void
  updateVideoState: (videoState: VideoState) => void
  addMessage: (message: ChatMessage) => void
  setQueue: (queue: QueueItem[]) => void
  muteUser: (userId: string) => void
  unmuteUser: (userId: string) => void
  banUser: (userId: string, details?: { displayName: string; avatarUrl?: string }) => void
  unbanUser: (userId: string) => void
  setRoomClosed: (reason: string, customReason?: string) => void
  setKicked: () => void
  reset: () => void
}

const initialState = {
  status: 'disconnected' as ConnectionStatus,
  error: null,
  room: null,
  members: [],
  videoState: null,
  messages: [],
  queue: [],
  mutedUserIds: [],
  bannedUserIds: [],
  bannedMemberDetails: {} as Record<string, BannedMemberDetail>,
  isClosed: false,
  closeReason: null,
  closeCustomReason: null,
  isKicked: false,
  currentVideoTitle: null,
}

export const useWatchPartyRoomStore = create<WatchPartyRoomState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setCurrentVideoTitle: (title) => set({ currentVideoTitle: title }),

  setRoomState: (state) => {
    const playingTitle = state.videoState?.videoId
      ? (state.queue.find((q) => q.videoId === state.videoState!.videoId)?.title ?? null)
      : null
    set({
      room: state.room,
      members: state.members,
      videoState: state.videoState,
      messages: state.recentMessages,
      queue: state.queue,
      mutedUserIds: state.mutedUserIds ?? [],
      bannedUserIds: state.bannedUserIds ?? [],
      status: 'connected',
      currentVideoTitle: playingTitle,
    })
  },

  addMember: (member) =>
    set((s) => ({
      members: s.members.some((m) => m.userId === member.userId)
        ? s.members.map((m) => (m.userId === member.userId ? member : m))
        : [...s.members, member],
    })),

  removeMember: (userId) =>
    set((s) => ({ members: s.members.filter((m) => m.userId !== userId) })),

  updateVideoState: (videoState) => set({ videoState }),

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),

  setQueue: (queue) => set({ queue }),

  muteUser: (userId) =>
    set((s) => ({
      mutedUserIds: s.mutedUserIds.includes(userId)
        ? s.mutedUserIds
        : [...s.mutedUserIds, userId],
    })),

  unmuteUser: (userId) =>
    set((s) => ({ mutedUserIds: s.mutedUserIds.filter((id) => id !== userId) })),

  banUser: (userId, details) =>
    set((s) => {
      const member = s.members.find((m) => m.userId === userId)
      const detail: BannedMemberDetail = {
        userId,
        displayName: details?.displayName ?? member?.displayName ?? `User ${userId.slice(0, 6)}`,
        avatarUrl: details?.avatarUrl ?? member?.avatarUrl,
      }
      return {
        bannedUserIds: s.bannedUserIds.includes(userId) ? s.bannedUserIds : [...s.bannedUserIds, userId],
        bannedMemberDetails: { ...s.bannedMemberDetails, [userId]: detail },
        members: s.members.filter((m) => m.userId !== userId),
      }
    }),

  unbanUser: (userId) =>
    set((s) => {
      const { [userId]: _, ...rest } = s.bannedMemberDetails
      return {
        bannedUserIds: s.bannedUserIds.filter((id) => id !== userId),
        bannedMemberDetails: rest,
      }
    }),

  setRoomClosed: (reason, customReason) => set({ isClosed: true, closeReason: reason, closeCustomReason: customReason ?? null }),

  setKicked: () => set({ isKicked: true }),

  reset: () => set(initialState),
}))
