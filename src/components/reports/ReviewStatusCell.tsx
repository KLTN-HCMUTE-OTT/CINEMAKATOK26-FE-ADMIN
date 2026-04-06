import { useState, useEffect } from 'react'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import { reviewReplyControllerFindOne } from '@/api/reviewReplies'

interface ReviewStatusCellProps {
  report: API.ReportDto
}

const ReviewStatusCell = ({ report }: ReviewStatusCellProps) => {
  const [replyStatus, setReplyStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchReplyStatus = async () => {
      if (report.type === 'REVIEW_REPLY' && report.targetId) {
        setLoading(true)
        try {
          const response = await reviewReplyControllerFindOne({ id: report.targetId })
          if (response?.data?.data) {
            setReplyStatus(response.data.data.status)
          }
        } catch (error) {
          console.error('Error fetching reply status:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchReplyStatus()
  }, [report.type, report.targetId])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
      </Box>
    )
  }

  if (report.type === 'REVIEW' && report.review?.status) {
    return (
      <Chip
        label={report.review.status}
        size='small'
        color={report.review.status === 'ACTIVE' ? 'success' : 'error'}
        variant='outlined'
      />
    )
  } else if (report.type === 'EPISODE_REVIEW' && report.episodeReview?.status) {
    return (
      <Chip
        label={report.episodeReview.status}
        size='small'
        color={report.episodeReview.status === 'ACTIVE' ? 'success' : 'error'}
        variant='outlined'
      />
    )
  } else if (report.type === 'REVIEW_REPLY' && replyStatus) {
    return (
      <Chip
        label={replyStatus}
        size='small'
        color={replyStatus === 'ACTIVE' ? 'success' : 'error'}
        variant='outlined'
      />
    )
  }

  return (
    <Typography variant='body2' color='text.secondary'>
      N/A
    </Typography>
  )
}

export default ReviewStatusCell
