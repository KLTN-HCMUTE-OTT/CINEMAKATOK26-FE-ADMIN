import React from 'react'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

vi.mock('@/api/review', () => ({
  reviewControllerFindAll: vi.fn()
}))
vi.mock('@/api/episodeReviews', () => ({
  episodeReviewControllerFindAll: vi.fn()
}))
vi.mock('@/api/reviewReplies', () => ({
  reviewReplyControllerFindAll: vi.fn()
}))

import { useReviews } from './useReviews'
import { reviewControllerFindAll } from '@/api/review'
import { episodeReviewControllerFindAll } from '@/api/episodeReviews'
import { reviewReplyControllerFindAll } from '@/api/reviewReplies'

const mockedReviewApi = vi.mocked(reviewControllerFindAll)
const mockedEpisodeApi = vi.mocked(episodeReviewControllerFindAll)
const mockedReplyApi = vi.mocked(reviewReplyControllerFindAll)

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(SWRConfig, { value: { dedupingInterval: 0, provider: () => new Map() } }, children)
}

describe('useReviews', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches REVIEW type by default', async () => {
    // Arrange
    mockedReviewApi.mockResolvedValue({
      data: {
        data: [{ id: 'r1', content: 'Nice', rating: 5, status: 'ACTIVE', name: 'User', userId: 'u1', createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
        meta: { totalItems: 1 }
      }
    } as any)

    // Act
    const { result } = renderHook(() => useReviews(), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].type).toBe('REVIEW')
    expect(result.current.totalItems).toBe(1)
    expect(mockedReviewApi).toHaveBeenCalled()
    expect(mockedEpisodeApi).not.toHaveBeenCalled()
  })

  it('fetches EPISODE_REVIEW type when specified', async () => {
    // Arrange
    mockedEpisodeApi.mockResolvedValue({
      data: { data: [{ id: 'e1' }], meta: { totalItems: 1 } }
    } as any)

    // Act
    const { result } = renderHook(() => useReviews({ type: 'EPISODE_REVIEW' }), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data[0].type).toBe('EPISODE_REVIEW')
    expect(mockedEpisodeApi).toHaveBeenCalled()
    expect(mockedReviewApi).not.toHaveBeenCalled()
  })

  it('fetches REVIEW_REPLY type when specified', async () => {
    // Arrange
    mockedReplyApi.mockResolvedValue({
      data: { data: [{ id: 'rp1' }], meta: { totalItems: 1 } }
    } as any)

    // Act
    const { result } = renderHook(() => useReviews({ type: 'REVIEW_REPLY' }), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data[0].type).toBe('REVIEW_REPLY')
    expect(mockedReplyApi).toHaveBeenCalled()
  })

  it('passes pagination and filter params to API', async () => {
    // Arrange
    mockedReviewApi.mockResolvedValue({
      data: { data: [], meta: { totalItems: 0 } }
    } as any)

    // Act
    renderHook(() => useReviews({ page: 3, limit: 20, search: 'spam', status: 'BANNED', sort: '-createdAt' }), {
      wrapper
    })

    // Assert
    await waitFor(() => {
      expect(mockedReviewApi).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 3,
          limit: 20,
          search: 'spam',
          status: 'BANNED',
          sort: '-createdAt'
        })
      )
    })
  })

  it('calculates totalPages from totalItems and limit', async () => {
    // Arrange
    mockedReviewApi.mockResolvedValue({
      data: { data: Array(10).fill({ id: '1' }), meta: { totalItems: 43 } }
    } as any)

    // Act
    const { result } = renderHook(() => useReviews({ limit: 10 }), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalPages).toBe(5)
  })

  it('returns error message on API failure', async () => {
    // Arrange
    mockedReviewApi.mockRejectedValue(new Error('Network error'))

    // Act
    const { result } = renderHook(() => useReviews(), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network error')
    expect(result.current.data).toEqual([])
  })

  it('returns empty data when API returns no items', async () => {
    // Arrange
    mockedReviewApi.mockResolvedValue({
      data: { data: null, meta: { totalItems: 0 } }
    } as any)

    // Act
    const { result } = renderHook(() => useReviews(), { wrapper })

    // Assert
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
    expect(result.current.totalItems).toBe(0)
  })
})
