'use client'

import { useState, useEffect } from 'react'
import { reviewControllerFindAll } from '@/api/reviews'
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
  userId: string
  createdAt: string
  updatedAt: string
  contentId?: string
  episodeId?: string
  reviewId?: any
  episodeReviewId?: any
  parentReplyId?: any
}

export const useReviews = ({ limit = 10, page = 1, search, sort, status, type = 'REVIEW' }: UseReviewsProps = {}) => {
  const [data, setData] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)

      let allReviews: ReviewItem[] = []
      let totalItemsCount = 0

      // Fetch regular reviews
      if (type === 'REVIEW') {
        const reviewsResponse = await reviewControllerFindAll({
          limit,
          page,
          search,
          sort,
          status
        })

        if (reviewsResponse.data?.data) {
          const reviews = reviewsResponse.data.data.map(review => ({
            ...review,
            type: 'REVIEW' as const
          }))
          allReviews = reviews
          totalItemsCount = reviewsResponse.data.meta?.totalItems || 0
        }
      }
      // Fetch episode reviews
      else if (type === 'EPISODE_REVIEW') {
        const episodeReviewsResponse = await episodeReviewControllerFindAll({
          limit,
          page,
          search,
          sort,
          status
        })

        if (episodeReviewsResponse.data?.data) {
          const episodeReviews = episodeReviewsResponse.data.data.map(review => ({
            ...review,
            type: 'EPISODE_REVIEW' as const
          }))
          allReviews = episodeReviews
          totalItemsCount = episodeReviewsResponse.data.meta?.totalItems || 0
        }
      }
      // Fetch review replies
      else if (type === 'REVIEW_REPLY') {
        const reviewRepliesResponse = await reviewReplyControllerFindAll({
          limit,
          page,
          search,
          sort,
          status
        })

        if (reviewRepliesResponse.data?.data) {
          const reviewReplies = reviewRepliesResponse.data.data.map(reply => ({
            ...reply,
            type: 'REVIEW_REPLY' as const
          }))
          allReviews = reviewReplies
          totalItemsCount = reviewRepliesResponse.data.meta?.totalItems || 0
        }
      }

      setData(allReviews)
      setTotalItems(totalItemsCount)
      setTotalPages(Math.ceil(totalItemsCount / limit))
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch reviews'
      setError(errorMessage)
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [limit, page, search, sort, status, type])

  return {
    data,
    loading,
    error,
    totalItems,
    totalPages,
    refetch: fetchReviews
  }
}
