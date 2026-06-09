import { useState, useCallback, useMemo } from 'react'

import useSWR from 'swr'
import { toast } from 'sonner'

import {
  watchPartyControllerAdminListRooms,
  watchPartyControllerAdminGetRoomDetails,
  watchPartyControllerAdminCloseRoom,
  watchPartyControllerAdminKickMember,
  watchPartyControllerAdminGetStats,
  watchPartyControllerAdminBanUser,
  watchPartyControllerAdminUnbanUser
} from '@/api/watchParty'
import { userControllerGetUsersByIds } from '@/api/users'

export const useWatchPartyManagement = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 20,
    search: '',
    selectedRoomId: ''
  })

  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const roomListKey = ['watch-party-rooms', query.page, query.limit, query.search] as const
  const roomDetailKey = query.selectedRoomId ? (['watch-party-room-detail', query.selectedRoomId] as const) : null
  const statsKey = ['watch-party-stats'] as const

  const {
    data: roomListResponse,
    error: roomListError,
    isLoading: roomListLoading,
    mutate: mutateRooms
  } = useSWR(roomListKey, async ([, page, limit, search]) => {
    const offset = (page - 1) * limit

    const response = await watchPartyControllerAdminListRooms({
      limit,
      offset,
      search: search || undefined
    })

    
return response.data
  })

  const {
    data: roomDetailResponse,
    error: roomDetailError,
    isLoading: roomDetailLoading,
    mutate: mutateRoomDetail
  } = useSWR(roomDetailKey, async ([, roomId]) => {
    const response = await watchPartyControllerAdminGetRoomDetails({ id: roomId })

    
return response.data as { data: API.WatchPartyRoomDetail } | undefined
  })

  const {
    data: statsResponse,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats
  } = useSWR(statsKey, async () => {
    const response = await watchPartyControllerAdminGetStats()

    
return response.data
  })

  const rooms: API.RoomListItemDto[] = roomListResponse?.data?.items || []
  const roomDetail: API.WatchPartyRoomDetail | null = (roomDetailResponse as any)?.data || null
  const stats: API.WatchPartyStatsResponse | null = statsResponse?.data || null

  // Collect unique user IDs from rooms (hosts) + room detail (members)
  const uniqueUserIds = useMemo(() => {
    const ids = new Set<string>()

    rooms.forEach(r => ids.add(r.hostId))

    if (roomDetail) {
      roomDetail.members.forEach(m => ids.add(m.userId))
      if (roomDetail.hostId) ids.add(roomDetail.hostId)
    }

    
return [...ids].filter(Boolean).sort()
  }, [rooms, roomDetail])

  const userBatchKey = uniqueUserIds.length > 0 ? (['users-batch', uniqueUserIds.join(',')] as const) : null

  const { data: userBatchResponse, isLoading: userBatchLoading } = useSWR(userBatchKey, async ([, idsStr]) => {
    const ids = idsStr.split(',').filter(Boolean)
    const response = await userControllerGetUsersByIds({ data: { ids } })

    
return response.data
  })

  // Build userId → UserDto map
  const userMap = useMemo<Map<string, API.UserDto>>(() => {
    const map = new Map<string, API.UserDto>()
    const users: API.UserDto[] = (userBatchResponse as any)?.data || userBatchResponse || []

    if (Array.isArray(users)) {
      users.forEach(u => map.set(u.id, u))
    }

    
return map
  }, [userBatchResponse])

  // Rooms enriched with host display info
  const roomsWithHost = useMemo(() => {
    return rooms.map(room => {
      const host = userMap.get(room.hostId)

      
return {
        ...room,
        hostDisplayName: host?.name ?? `user-${room.hostId.slice(0, 6)}`,
        hostAvatarUrl: host?.avatar ?? undefined
      }
    })
  }, [rooms, userMap])

  const pagination = {
    page: query.page,
    limit: query.limit,
    totalItems: roomListResponse?.data?.total || 0,
    totalPages: Math.ceil((roomListResponse?.data?.total || 0) / Math.max(query.limit, 1))
  }

  const loading = roomListLoading || roomDetailLoading || statsLoading || userBatchLoading || actionLoading

  const error =
    actionError ||
    ((roomListError as any)?.response?.data?.message as string | undefined) ||
    ((roomDetailError as any)?.response?.data?.message as string | undefined) ||
    ((statsError as any)?.response?.data?.message as string | undefined) ||
    null

  const fetchRooms = useCallback(async (page: number = 1, limit: number = 20, search: string = '') => {
    setQuery(prev => ({ ...prev, page, limit, search }))
  }, [])

  const fetchRoomDetail = useCallback(
    async (roomId: string) => {
      setQuery(prev => ({ ...prev, selectedRoomId: roomId }))

      if (query.selectedRoomId === roomId) {
        await mutateRoomDetail()
      }
    },
    [mutateRoomDetail, query.selectedRoomId]
  )

  const refreshStats = useCallback(async () => {
    await mutateStats()
  }, [mutateStats])

  const closeRoom = useCallback(
    async (roomId: string, reason?: string) => {
      setActionLoading(true)
      setActionError(null)

      const rollback = roomListResponse

      await mutateRooms(
        current => {
          const typedCurrent = (current as API.RoomListResponseResponseDto | undefined) || rollback

          if (!typedCurrent?.data?.items) return typedCurrent
          
return {
            ...typedCurrent,
            data: {
              ...typedCurrent.data,
              items: typedCurrent.data.items.filter((r: API.RoomListItemDto) => r.roomId !== roomId)
            }
          }
        },
        { revalidate: false }
      )

      try {
        await watchPartyControllerAdminCloseRoom({ id: roomId }, { reason })
        await Promise.all([mutateRooms(), mutateStats()])
        toast.success('Room closed successfully')
        
return { success: true }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to close room'

        await mutateRooms(rollback, { revalidate: false })
        setActionError(errorMsg)
        toast.error(errorMsg)
        
return { success: false, error: errorMsg }
      } finally {
        setActionLoading(false)
      }
    },
    [mutateRooms, mutateStats, roomListResponse]
  )

  const kickMember = useCallback(
    async (roomId: string, userId: string) => {
      setActionLoading(true)
      setActionError(null)

      const rollback = roomDetailResponse

      await mutateRoomDetail(
        current => {
          const detail = (current as any)?.data as API.WatchPartyRoomDetail | undefined

          if (!detail) return current
          
return {
            ...(current as any),
            data: { ...detail, members: detail.members.filter(m => m.userId !== userId) }
          }
        },
        { revalidate: false }
      )

      try {
        await watchPartyControllerAdminKickMember({ id: roomId, userId })
        await mutateRoomDetail()
        toast.success('Member kicked successfully')
        
return { success: true }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to kick member'

        await mutateRoomDetail(rollback, { revalidate: false })
        setActionError(errorMsg)
        toast.error(errorMsg)
        
return { success: false, error: errorMsg }
      } finally {
        setActionLoading(false)
      }
    },
    [mutateRoomDetail, roomDetailResponse]
  )

  const banUser = useCallback(async (userId: string, durationSec?: number, reason?: string) => {
    setActionLoading(true)
    setActionError(null)

    try {
      await watchPartyControllerAdminBanUser({ userId }, { durationSec, reason })
      toast.success('User banned from Watch Party')
      
return { success: true }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to ban user'

      setActionError(errorMsg)
      toast.error(errorMsg)
      
return { success: false, error: errorMsg }
    } finally {
      setActionLoading(false)
    }
  }, [])

  const unbanUser = useCallback(async (userId: string) => {
    setActionLoading(true)
    setActionError(null)

    try {
      await watchPartyControllerAdminUnbanUser({ userId })
      toast.success('User unbanned from Watch Party')
      
return { success: true }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to unban user'

      setActionError(errorMsg)
      toast.error(errorMsg)
      
return { success: false, error: errorMsg }
    } finally {
      setActionLoading(false)
    }
  }, [])

  return {
    rooms,
    roomsWithHost,
    roomDetail,
    userMap,
    stats,
    loading,
    error,
    pagination,
    fetchRooms,
    fetchRoomDetail,
    refreshStats,
    closeRoom,
    kickMember,
    banUser,
    unbanUser
  }
}
