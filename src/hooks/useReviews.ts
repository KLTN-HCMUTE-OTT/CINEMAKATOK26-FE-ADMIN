'use client'

import useSWR from 'swr'

import { reviewControllerFindAll } from '@/api/review'
import { episodeReviewControllerFindAll } from '@/api/episodeReviews'
import { reviewReplyControllerFindAll } from '@/api/reviewReplies'

interface UseReviewsProps {
  limit?: number
  page?: number
  search?: string
  sort?: string
  status?: 'ACTIVE' | 'BANNED'
  type?: 'REVIEW' | 'EPISODE_REVIEW' | 'REVIEW_REPLY'
}

interface ReviewItem {
  id: string
  type: 'REVIEW' | 'EPISODE_REVIEW' | 'REVIEW_REPLY'
  contentReviewed?: string
  content?: string
  rating?: number
  status: 'ACTIVE' | 'BANNED'
  name: string
  avatar?: any
  userId?: string
  createdAt: string
  updatedAt: string
  contentId?: string
  episodeId?: string
  reviewId?: any
  episodeReviewId?: any
  parentReplyId?: any
}

export const useReviews = ({ limit = 10, page = 1, search, sort, status, type = 'REVIEW' }: UseReviewsProps = {}) => {
  const key = ['reviews', { limit, page, search, sort, status, type }] as const

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async ([, params]) => {
      let allReviews: ReviewItem[] = []
      let totalItemsCount = 0

      if (params.type === 'REVIEW') {
        const reviewsResponse = await reviewControllerFindAll({
          limit: params.limit,
          page: params.page,
          search: params.search,
          sort: params.sort,
          status: params.status
        })

        if (reviewsResponse.data?.data) {
          allReviews = reviewsResponse.data.data.map(review => ({
            ...review,
            type: 'REVIEW' as const
          }))
          totalItemsCount = reviewsResponse.data.meta?.totalItems || 0
        }
      } else if (params.type === 'EPISODE_REVIEW') {
        const episodeReviewsResponse = await episodeReviewControllerFindAll({
          limit: params.limit,
          page: params.page,
          search: params.search,
          sort: params.sort,
          status: params.status
        })

        if (episodeReviewsResponse.data?.data) {
          allReviews = episodeReviewsResponse.data.data.map(review => ({
            ...review,
            type: 'EPISODE_REVIEW' as const
          }))
          totalItemsCount = episodeReviewsResponse.data.meta?.totalItems || 0
        }
      } else if (params.type === 'REVIEW_REPLY') {
        const reviewRepliesResponse = await reviewReplyControllerFindAll({
          limit: params.limit,
          page: params.page,
          search: params.search,
          sort: params.sort,
          status: params.status
        })

        if (reviewRepliesResponse.data?.data) {
          allReviews = reviewRepliesResponse.data.data.map(reply => ({
            ...reply,
            type: 'REVIEW_REPLY' as const
          }))
          totalItemsCount = reviewRepliesResponse.data.meta?.totalItems || 0
        }
      }

      return {
        items: allReviews,
        totalItems: totalItemsCount,
        totalPages: Math.ceil(totalItemsCount / params.limit)
      }
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 3
    }
  )

  return {
    data: data?.items ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    totalItems: data?.totalItems ?? 0,
    totalPages: data?.totalPages ?? 0,
    refetch: () => mutate()
  }
}
