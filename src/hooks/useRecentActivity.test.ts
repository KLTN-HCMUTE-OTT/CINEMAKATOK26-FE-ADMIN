import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import React from 'react'

// Mock the API module
vi.mock('@/api/auditLogs', () => ({
  auditLogControllerGetRecentActivity: vi.fn()
}))

import { useRecentActivity } from './useRecentActivity'
import { auditLogControllerGetRecentActivity } from '@/api/auditLogs'

const mockedApi = vi.mocked(auditLogControllerGetRecentActivity)

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    children
  )
}

describe('useRecentActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    mockedApi.mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useRecentActivity(), { wrapper })

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.totalItems).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('fetches and returns activity data on success', async () => {
    mockedApi.mockResolvedValue({
      data: {
        statusCode: 200,
        data: [
          {
            id: 'act-1',
            userName: 'Admin',
            action: 'LOGIN',
            description: 'Logged in',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        meta: { totalItems: 1 }
      }
    } as any)

    const { result } = renderHook(() => useRecentActivity({ limit: 5, page: 1 }), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].userName).toBe('Admin')
    expect(result.current.totalItems).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('passes pagination params to API', async () => {
    mockedApi.mockResolvedValue({
      data: { statusCode: 200, data: [], meta: { totalItems: 0 } }
    } as any)

    renderHook(() => useRecentActivity({ limit: 25, page: 3 }), { wrapper })

    await waitFor(() => {
      expect(mockedApi).toHaveBeenCalledWith({ limit: 25, page: 3 })
    })
  })

  it('returns error message when API fails', async () => {
    mockedApi.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useRecentActivity(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.data).toEqual([])
  })

  it('returns error when statusCode is not 200', async () => {
    mockedApi.mockResolvedValue({
      data: { statusCode: 500, data: null, meta: null }
    } as any)

    const { result } = renderHook(() => useRecentActivity(), { wrapper })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch recent activity')
  })

  it('uses default params when none provided', async () => {
    mockedApi.mockResolvedValue({
      data: { statusCode: 200, data: [], meta: { totalItems: 0 } }
    } as any)

    renderHook(() => useRecentActivity(), { wrapper })

    await waitFor(() => {
      expect(mockedApi).toHaveBeenCalledWith({ limit: 10, page: 1 })
    })
  })
})
