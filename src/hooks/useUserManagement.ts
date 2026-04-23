import { useState, useCallback } from 'react'
import useSWR from 'swr'
import {
  userControllerFindAll,
  userControllerGetUserDetail,
  userControllerUpdateUserInfo,
  userControllerBanUser,
  userControllerUnbanUser
} from '@/api/users'

type User = API.UserDto
type UserDetail = API.UserDetailDto

export const useUserManagement = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    selectedUserId: ''
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const userListKey = ['users', query.page, query.limit, query.search] as const
  const userDetailKey = query.selectedUserId ? (['user-detail', query.selectedUserId] as const) : null

  const {
    data: usersResponse,
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateUsers
  } = useSWR(userListKey, async ([, page, limit, search]) => {
    const response = await userControllerFindAll({
      page: page.toString(),
      limit: limit.toString(),
      search: search || ''
    })

    return response.data
  })

  const {
    data: userDetailResponse,
    error: userDetailError,
    isLoading: userDetailLoading,
    mutate: mutateUserDetail
  } = useSWR(userDetailKey, async ([, userId]) => {
    const response = await userControllerGetUserDetail({ id: userId })

    return response.data
  })

  const pagination = {
    page: query.page,
    limit: query.limit,
    totalItems: usersResponse?.meta?.totalItems || 0,
    totalPages:
      usersResponse?.meta?.totalPages || Math.ceil((usersResponse?.meta?.totalItems || 0) / Math.max(query.limit, 1))
  }

  const users = usersResponse?.data || []
  const userDetail = (userDetailResponse?.data as UserDetail | undefined) || null
  const loading = usersLoading || userDetailLoading || actionLoading
  const error =
    actionError ||
    ((usersError as any)?.response?.data?.message as string | undefined) ||
    ((userDetailError as any)?.response?.data?.message as string | undefined) ||
    null

  // Fetch all users
  const fetchUsers = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
    setQuery(prev => ({ ...prev, page, limit, search }))
  }, [])

  // Fetch user detail
  const fetchUserDetail = useCallback(
    async (userId: string) => {
      setQuery(prev => ({ ...prev, selectedUserId: userId }))

      if (query.selectedUserId === userId) {
        await mutateUserDetail()
      }
    },
    [mutateUserDetail, query.selectedUserId]
  )

  // Update user info
  const updateUserInfo = useCallback(
    async (userId: string, data: any) => {
      setActionLoading(true)
      setActionError(null)

      try {
        const response = await userControllerUpdateUserInfo({ id: userId }, data)

        if (response.data?.data) {
          await Promise.all([mutateUsers(), mutateUserDetail()])
          return { success: true, data: response.data.data }
        }

        return { success: false, error: 'Failed to update user' }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to update user'

        setActionError(errorMsg)
        return { success: false, error: errorMsg }
      } finally {
        setActionLoading(false)
      }
    },
    [mutateUserDetail, mutateUsers]
  )

  // Ban user
  const banUser = useCallback(
    async (userId: string, reason: string, durationDays: number = 0) => {
      setActionLoading(true)
      setActionError(null)

      const rollbackUsers = usersResponse as API.UserDtoPaginatedResponseDto | undefined
      const rollbackUserDetail = userDetailResponse

      await mutateUsers(
        current => {
          const typedCurrent = (current as API.UserDtoPaginatedResponseDto | undefined) || rollbackUsers
          if (!typedCurrent?.data) return typedCurrent

          return {
            ...typedCurrent,
            data: typedCurrent.data.map(user => (user.id === userId ? { ...user, isBanned: true } : user))
          }
        },
        { revalidate: false }
      )

      if (query.selectedUserId === userId) {
        await mutateUserDetail(
          current => {
            const typedCurrent = (current as any) || rollbackUserDetail
            if (!typedCurrent?.data) return typedCurrent

            return {
              ...typedCurrent,
              data: {
                ...typedCurrent.data,
                isBanned: true
              }
            }
          },
          { revalidate: false }
        )
      }

      try {
        const response = await userControllerBanUser({ id: userId }, { banReason: reason, durationDays })

        if (response.data?.data) {
          await Promise.all([mutateUsers(), mutateUserDetail()])
          return { success: true, data: response.data.data }
        }

        return { success: false, error: 'Failed to ban user' }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to ban user'

        await mutateUsers(rollbackUsers, { revalidate: false })
        if (query.selectedUserId === userId) {
          await mutateUserDetail(rollbackUserDetail, { revalidate: false })
        }

        setActionError(errorMsg)
        return { success: false, error: errorMsg }
      } finally {
        setActionLoading(false)
      }
    },
    [mutateUserDetail, mutateUsers, query.selectedUserId, userDetailResponse, usersResponse]
  )

  // Unban user
  const unbanUser = useCallback(
    async (userId: string) => {
      setActionLoading(true)
      setActionError(null)

      const rollbackUsers = usersResponse as API.UserDtoPaginatedResponseDto | undefined
      const rollbackUserDetail = userDetailResponse

      await mutateUsers(
        current => {
          const typedCurrent = (current as API.UserDtoPaginatedResponseDto | undefined) || rollbackUsers
          if (!typedCurrent?.data) return typedCurrent

          return {
            ...typedCurrent,
            data: typedCurrent.data.map(user => (user.id === userId ? { ...user, isBanned: false } : user))
          }
        },
        { revalidate: false }
      )

      if (query.selectedUserId === userId) {
        await mutateUserDetail(
          current => {
            const typedCurrent = (current as any) || rollbackUserDetail
            if (!typedCurrent?.data) return typedCurrent

            return {
              ...typedCurrent,
              data: {
                ...typedCurrent.data,
                isBanned: false
              }
            }
          },
          { revalidate: false }
        )
      }

      try {
        const response = await userControllerUnbanUser({ id: userId })

        if (response.data?.data) {
          await Promise.all([mutateUsers(), mutateUserDetail()])
          return { success: true, data: response.data.data }
        }

        return { success: false, error: 'Failed to unban user' }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to unban user'

        await mutateUsers(rollbackUsers, { revalidate: false })
        if (query.selectedUserId === userId) {
          await mutateUserDetail(rollbackUserDetail, { revalidate: false })
        }

        setActionError(errorMsg)
        return { success: false, error: errorMsg }
      } finally {
        setActionLoading(false)
      }
    },
    [mutateUserDetail, mutateUsers, query.selectedUserId, userDetailResponse, usersResponse]
  )

  return {
    users,
    userDetail,
    loading,
    error,
    pagination,
    fetchUsers,
    fetchUserDetail,
    updateUserInfo,
    banUser,
    unbanUser
  }
}
