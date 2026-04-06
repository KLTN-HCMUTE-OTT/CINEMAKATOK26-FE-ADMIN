import { useState, useCallback } from 'react'
import {
  userControllerFindAll,
  userControllerGetUserDetail,
  userControllerUpdateUserInfo,
  userControllerBanUser,
  userControllerUnbanUser
} from '@/api/user'

type User = API.UserDto
type UserDetail = API.UserDetailDto

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  })

  // Fetch all users
  const fetchUsers = useCallback(async (page: number = 1, limit: number = 10, search: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const response = await userControllerFindAll({
        page: page.toString(),
        limit: limit.toString(),
        search: search || ''
      })

      if (response.data?.data) {
        setUsers(response.data.data)
        setPagination({
          page,
          limit,
          totalItems: response.data.meta?.totalItems || 0,
          totalPages: response.data.meta?.totalPages || Math.ceil((response.data.meta?.totalItems || 0) / limit)
        })
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch users'
      setError(errorMsg)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch user detail
  const fetchUserDetail = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await userControllerGetUserDetail({ id: userId })

      if (response.data?.data) {
        setUserDetail(response.data.data as any)
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Failed to fetch user detail'
      setError(errorMsg)
      console.error('Error fetching user detail:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update user info
  const updateUserInfo = useCallback(
    async (userId: string, data: any) => {
      setLoading(true)
      setError(null)
      try {
        const response = await userControllerUpdateUserInfo({ id: userId }, data)

        if (response.data?.data) {
          setUserDetail(response.data.data as any)
          // Refresh users list
          await fetchUsers(pagination.page, pagination.limit)
          return { success: true, data: response.data.data }
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to update user'
        setError(errorMsg)
        console.error('Error updating user:', err)
        return { success: false, error: errorMsg }
      } finally {
        setLoading(false)
      }
    },
    [fetchUsers, pagination.page, pagination.limit]
  )

  // Ban user
  const banUser = useCallback(
    async (userId: string, reason: string, durationDays: number = 0) => {
      setLoading(true)
      setError(null)
      try {
        const response = await userControllerBanUser({ id: userId }, { banReason: reason, durationDays })

        if (response.data?.data) {
          setUserDetail(response.data.data as any)
          // Refresh users list
          await fetchUsers(pagination.page, pagination.limit)
          return { success: true, data: response.data.data }
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to ban user'
        setError(errorMsg)
        console.error('Error banning user:', err)
        return { success: false, error: errorMsg }
      } finally {
        setLoading(false)
      }
    },
    [fetchUsers, pagination.page, pagination.limit]
  )

  // Unban user
  const unbanUser = useCallback(
    async (userId: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await userControllerUnbanUser({ id: userId })

        if (response.data?.data) {
          setUserDetail(response.data.data as any)
          // Refresh users list
          await fetchUsers(pagination.page, pagination.limit)
          return { success: true, data: response.data.data }
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || 'Failed to unban user'
        setError(errorMsg)
        console.error('Error unbanning user:', err)
        return { success: false, error: errorMsg }
      } finally {
        setLoading(false)
      }
    },
    [fetchUsers, pagination.page, pagination.limit]
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
