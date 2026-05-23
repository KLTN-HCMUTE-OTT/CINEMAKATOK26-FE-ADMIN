export type MemberRole = 'host' | 'admin' | 'member'

export interface RoomMember {
  userId: string
  displayName: string
  avatarUrl?: string
  joinedAt: number
  role?: MemberRole
}

export interface VideoState {
  isPlaying: boolean
  currentTime: number
  lastUpdatedAt: number
  videoId: string
  startedAt: number | null
  status: 'playing' | 'awaiting_host'
}

export interface ChatMessage {
  id: string
  userId: string
  displayName: string
  text: string
  createdAt: number
}

export interface QueueItem {
  videoId: string
  title: string
  thumbnailUrl?: string
  durationSec?: number
  addedBy: string
  addedAt: number
}

export interface RoomSummary {
  roomId: string
  inviteCode: string
  hostId: string
  videoId: string
  title: string
  requirePassword: boolean
  isPublic: boolean
  maxMembers: number
  memberCount: number
  createdAt: number
}

export interface RoomState {
  room: RoomSummary
  members: RoomMember[]
  videoState: VideoState
  recentMessages: ChatMessage[]
  queue: QueueItem[]
  mutedUserIds?: string[]
  bannedUserIds?: string[]
}

export type RoomCloseReason = 'host_left' | 'host_closed' | 'expired' | 'idle' | 'admin_closed'
