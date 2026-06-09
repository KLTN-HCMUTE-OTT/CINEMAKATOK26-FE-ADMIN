import { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import {
  reviewReplyControllerGetRepliesForReview,
  reviewReplyControllerGetRepliesForEpisodeReview,
  reviewReplyControllerFindOne
} from '@/api/reviewReplies'
import { reviewControllerFindOne } from '@/api/review'
import { episodeReviewControllerFindOne } from '@/api/episodeReviews'

interface ConversationModalProps {
  open: boolean
  report: API.ReportDto | null
  onClose: () => void
  isReportContext?: boolean
  onReplyAction?: (action: 'ban' | 'unban', replyId: string) => Promise<void>
}

const ConversationModal = ({
  open,
  report,
  onClose,
  isReportContext = true,
  onReplyAction
}: ConversationModalProps) => {
  const [replies, setReplies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [originalReview, setOriginalReview] = useState<any>(null)

  useEffect(() => {
    const fetchConversation = async () => {
      if (!report || !open) return

      setLoading(true)
      setError(null)
      setReplies([])
      setOriginalReview(null)

      try {
        let response
        let reviewId: string | undefined
        let episodeReviewId: string | undefined
        let fetchedReview: any = null

        // Xác định review/episodeReview ID
        if (report.type === 'REVIEW' && report.review?.id) {
          reviewId = report.review.id
          fetchedReview = report.review
        } else if (report.type === 'EPISODE_REVIEW' && report.episodeReview?.id) {
          episodeReviewId = report.episodeReview.id
          fetchedReview = report.episodeReview
        } else if (report.type === 'REVIEW_REPLY') {
          // Fetch reply để lấy reviewId hoặc episodeReviewId
          const replyResponse = await reviewReplyControllerFindOne({ id: report.targetId })

          if (replyResponse?.data?.data) {
            const replyData = replyResponse.data.data

            console.log('Reply data:', replyData)

            // Xác định và lấy reviewId
            if (replyData.reviewId) {
              if (typeof replyData.reviewId === 'string') {
                reviewId = replyData.reviewId
              } else if (typeof replyData.reviewId === 'object' && replyData.reviewId !== null) {
                reviewId = (replyData.reviewId as any).id || (replyData.reviewId as any)._id
              }

              // Fetch review data từ API
              if (reviewId) {
                try {
                  const reviewResponse = await reviewControllerFindOne({ id: reviewId })

                  if (reviewResponse?.data?.data) {
                    fetchedReview = reviewResponse.data.data
                    console.log('Fetched review:', fetchedReview)
                  }
                } catch (err) {
                  console.error('Error fetching review:', err)
                }
              }
            }

            // Xác định và lấy episodeReviewId
            if (!reviewId && replyData.episodeReviewId) {
              if (typeof replyData.episodeReviewId === 'string') {
                episodeReviewId = replyData.episodeReviewId
              } else if (typeof replyData.episodeReviewId === 'object' && replyData.episodeReviewId !== null) {
                episodeReviewId = (replyData.episodeReviewId as any).id || (replyData.episodeReviewId as any)._id
              }

              // Fetch episode review data từ API
              if (episodeReviewId) {
                try {
                  const episodeReviewResponse = await episodeReviewControllerFindOne({ id: episodeReviewId })

                  if (episodeReviewResponse?.data?.data) {
                    fetchedReview = episodeReviewResponse.data.data
                    console.log('Fetched episode review:', fetchedReview)
                  }
                } catch (err) {
                  console.error('Error fetching episode review:', err)
                }
              }
            }
          }
        }

        setOriginalReview(fetchedReview)

        // Fetch conversation dựa trên review type (cả ACTIVE và BANNED)
        let allReplies: any[] = []

        if (reviewId) {
          const [activeRes, bannedRes] = await Promise.all([
            reviewReplyControllerGetRepliesForReview({ reviewId, limit: 1000, page: 1, status: 'ACTIVE' as any } as any),
            reviewReplyControllerGetRepliesForReview({ reviewId, limit: 1000, page: 1, status: 'BANNED' as any } as any)
          ])

          allReplies = [
            ...(activeRes?.data?.data || []),
            ...(bannedRes?.data?.data || [])
          ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        } else if (episodeReviewId) {
          const [activeRes, bannedRes] = await Promise.all([
            reviewReplyControllerGetRepliesForEpisodeReview({ episodeReviewId, limit: 1000, page: 1, status: 'ACTIVE' as any } as any),
            reviewReplyControllerGetRepliesForEpisodeReview({ episodeReviewId, limit: 1000, page: 1, status: 'BANNED' as any } as any)
          ])

          allReplies = [
            ...(activeRes?.data?.data || []),
            ...(bannedRes?.data?.data || [])
          ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }

        setReplies(allReplies)
      } catch (err) {
        console.error('Failed to fetch conversation:', err)
        setError('Failed to load conversation thread')
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [report, open])

  if (!report) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Conversation Thread</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {originalReview && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Original Review
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {new Date(originalReview.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant='body2' sx={{ color: 'text.primary' }}>
                  {originalReview.contentReviewed}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                  By: {originalReview.name || 'Unknown'}
                </Typography>
              </Box>
            )}

            {replies.map((reply: any) => {
              const isReported = isReportContext && reply.id === report.targetId
              const isViewedReply = !isReportContext && reply.id === report.targetId
              const isNested = reply.parentReplyId !== null

              return (
                <Box
                  key={reply.id}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: isReported
                      ? 'rgba(244, 67, 54, 0.08)'
                      : isViewedReply
                        ? 'rgba(76, 175, 80, 0.08)'
                        : 'action.hover',
                    border: isReported || isViewedReply ? '2px solid' : '1px solid',
                    borderColor: isReported ? 'error.main' : isViewedReply ? 'success.main' : 'divider',
                    ml: isNested ? 4 : 0
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography
                      variant='subtitle2'
                      sx={{
                        fontWeight: isReported || isViewedReply ? 600 : 500,
                        color: isReported ? 'error.main' : isViewedReply ? 'success.main' : 'text.primary'
                      }}
                    >
                      {isReported ? 'Reported Reply' : isViewedReply ? 'Viewing Reply' : 'Reply'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(reply.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.primary' }}>
                    {reply.content}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    By: {reply.name || 'Unknown'}
                  </Typography>
                  {isNested && (
                    <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                      Reply to a previous comment
                    </Typography>
                  )}
                  {!isReportContext && onReplyAction && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {reply.status === 'ACTIVE' ? (
                        <Button
                          size='small'
                          variant='outlined'
                          color='error'
                          onClick={async () => {
                            await onReplyAction('ban', reply.id)
                            setReplies(prev => prev.map(r => r.id === reply.id ? { ...r, status: 'BANNED' } : r))
                          }}
                        >
                          Ban
                        </Button>
                      ) : (
                        <Button
                          size='small'
                          variant='outlined'
                          color='success'
                          onClick={async () => {
                            await onReplyAction('unban', reply.id)
                            setReplies(prev => prev.map(r => r.id === reply.id ? { ...r, status: 'ACTIVE' } : r))
                          }}
                        >
                          Unban
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConversationModal
