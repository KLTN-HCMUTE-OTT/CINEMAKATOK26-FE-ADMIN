import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import React from 'react'

vi.mock('@/api/users', () => ({
  userControllerFindAll: vi.fn(),
  userControllerGetUserDetail: vi.fn(),
  userControllerUpdateUserInfo: vi.fn(),
  userControllerBanUser: vi.fn(),
  userControllerUnbanUser: vi.fn()
}))

import { useUserManagement } from './useUserManagement'
import {
  userControllerFindAll,
  userControllerGetUserDetail,
  userControllerBanUser,
  userControllerUnbanUser,
  userControllerUpdateUserInfo
} from '@/api/users'

const mockedFindAll = vi.mocked(userControllerFindAll)
const mockedGetDetail = vi.mocked(userControllerGetUserDetail)
const mockedBanUser = vi.mocked(userControllerBanUser)
const mockedUnbanUser = vi.mocked(userControllerUnbanUser)
const mockedUpdateUser = vi.mocked(userControllerUpdateUserInfo)

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    children
  )
}

const mockUsersResponse = {
  data: {
    data: [
      { id: 'u1', name: 'User One', email: 'u1@test.com', isBanned: false },
      { id: 'u2', name: 'User Two', email: 'u2@test.com', isBanned: true }
    ],
    meta: { totalItems: 2, totalPages: 1 }
  }
}

describe('useUserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFindAll.mockResolvedValue(mockUsersResponse as any)
    mockedGetDetail.mockResolvedValue({
      data: {
        data: { id: 'u1', name: 'User One', email: 'u1@test.com', isBanned: false }
      }
    } as any)
  })

  it('fetches users list on mount', async () => {
    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.users).toHaveLength(2)
    expect(result.current.users[0].name).toBe('User One')
  })

  it('exposes pagination metadata', async () => {
    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.pagination.totalItems).toBe(2)
    expect(result.current.pagination.page).toBe(1)
    expect(result.current.pagination.limit).toBe(10)
  })

  it('fetchUsers updates query params', async () => {
    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.fetchUsers(2, 20, 'admin')
    })

    await waitFor(() => {
      expect(mockedFindAll).toHaveBeenCalledWith({
        page: '2',
        limit: '20',
        search: 'admin'
      })
    })
  })

  it('banUser calls API and returns success', async () => {
    mockedBanUser.mockResolvedValue({
      data: { data: { id: 'u1', isBanned: true } }
    } as any)

    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let banResult: any
    await act(async () => {
      banResult = await result.current.banUser('u1', 'spamming', 30)
    })

    expect(banResult.success).toBe(true)
    expect(mockedBanUser).toHaveBeenCalledWith(
      { id: 'u1' },
      { banReason: 'spamming', durationDays: 30 }
    )
  })

  it('banUser rolls back on API failure', async () => {
    mockedBanUser.mockRejectedValue({
      response: { data: { message: 'Cannot ban admin' } }
    })

    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let banResult: any
    await act(async () => {
      banResult = await result.current.banUser('u1', 'test', 0)
    })

    expect(banResult.success).toBe(false)
    expect(banResult.error).toBe('Cannot ban admin')
    expect(result.current.error).toBe('Cannot ban admin')
  })

  it('unbanUser calls API and returns success', async () => {
    mockedUnbanUser.mockResolvedValue({
      data: { data: { id: 'u2', isBanned: false } }
    } as any)

    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let unbanResult: any
    await act(async () => {
      unbanResult = await result.current.unbanUser('u2')
    })

    expect(unbanResult.success).toBe(true)
    expect(mockedUnbanUser).toHaveBeenCalledWith({ id: 'u2' })
  })

  it('updateUserInfo calls API with correct params', async () => {
    mockedUpdateUser.mockResolvedValue({
      data: { data: { id: 'u1', name: 'Updated Name' } }
    } as any)

    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let updateResult: any
    await act(async () => {
      updateResult = await result.current.updateUserInfo('u1', { name: 'Updated Name' })
    })

    expect(updateResult.success).toBe(true)
    expect(mockedUpdateUser).toHaveBeenCalledWith({ id: 'u1' }, { name: 'Updated Name' })
  })

  it('returns error state when users fetch fails', async () => {
    mockedFindAll.mockRejectedValue({
      response: { data: { message: 'Server error' } }
    })

    const { result } = renderHook(() => useUserManagement(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Server error')
    expect(result.current.users).toEqual([])
  })
})
