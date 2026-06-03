// Hand-written augmentation of the generated `API` namespace.
// The admin watch-party room-detail endpoint returns `any` from the codegen
// (see watchPartyControllerAdminGetRoomDetails), so these shapes are declared
// here to type the consumers. Keep in sync with the server response.
declare namespace API {
  type WatchPartyMember = {
    userId: string
    displayName?: string
    avatarUrl?: string
    joinedAt: number
    role?: 'host' | 'admin' | 'member'
  }

  type WatchPartyChatMessage = {
    userId: string
    content: string
    timestamp: number
  }

  type WatchPartyBanEntry = {
    userId: string
    reason?: string
    bannedUntil?: number
  }

  type WatchPartyMuteEntry = {
    userId: string
    mutedUntil?: number
  }

  type WatchPartyRoomModeration = {
    banList: WatchPartyBanEntry[]
    muteList: WatchPartyMuteEntry[]
  }

  type WatchPartyRoomVideoState = {
    isPlaying: boolean
    currentTime: number
    videoId?: string
  }

  type WatchPartyRoomDetail = {
    roomId: string
    hostId: string
    videoId: string
    title?: string
    isPublic: boolean
    requirePassword: boolean
    inviteCode?: string
    maxMembers?: number
    createdAt: number
    members: WatchPartyMember[]
    videoState?: WatchPartyRoomVideoState
    chatMessages: WatchPartyChatMessage[]
    moderation?: WatchPartyRoomModeration
  }
}
