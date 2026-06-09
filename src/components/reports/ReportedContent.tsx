import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { reviewReplyControllerFindOne } from '@/api/reviewReplies'

interface ReportedContentProps {
  report: API.ReportDto
}

const ReportedContent = ({ report }: ReportedContentProps) => {
  const [replyContent, setReplyContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchReplyContent = async () => {
      if (report.type === 'REVIEW_REPLY' && report.targetId) {
        setLoading(true)

        try {
          const response = await reviewReplyControllerFindOne({ id: report.targetId })

          if (response?.data?.data) {
            setReplyContent(response.data.data.content)
          }
        } catch (error) {
          console.error('Error fetching reply:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchReplyContent()
  }, [report.type, report.targetId])

  const getReportedContent = () => {
    if (report.type === 'REVIEW' && report.review) {
      return report.review.contentReviewed || 'Review content'
    } else if (report.type === 'EPISODE_REVIEW' && report.episodeReview) {
      return report.episodeReview.contentReviewed || 'Episode review content'
    } else if (report.type === 'REVIEW_REPLY') {
      return replyContent || 'Loading reply...'
    }

    
return 'Unknown content'
  }

  if (loading && report.type === 'REVIEW_REPLY') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant='body2' color='text.secondary'>
          Loading...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {getReportedContent()}
      </Typography>
    </Box>
  )
}

export default ReportedContent
