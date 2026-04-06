import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import StatusChip from './StatusChip'
import TypeChip from './TypeChip'
import { reviewReplyControllerFindOne } from '@/api/reviewReplies'

interface ViewReportModalProps {
  open: boolean
  report: API.ReportDto | null
  onClose: () => void
  onAction: (action: 'approve' | 'reject' | 'ban' | 'delete') => void
  onViewConversation: () => void
}

const ViewReportModal = ({ open, report, onClose, onAction, onViewConversation }: ViewReportModalProps) => {
  const [replyData, setReplyData] = useState<API.ReviewReplyDto | null>(null)
  const [loadingReply, setLoadingReply] = useState(false)

  useEffect(() => {
    const fetchReplyData = async () => {
      if (report && report.type === 'REVIEW_REPLY' && report.targetId) {
        setLoadingReply(true)
        try {
          const response = await reviewReplyControllerFindOne({ id: report.targetId })
          if (response?.data?.data) {
            setReplyData(response.data.data)
          }
        } catch (error) {
          console.error('Error fetching reply details:', error)
        } finally {
          setLoadingReply(false)
        }
      }
    }

    fetchReplyData()
  }, [report])

  if (!report) return null

  const getReportedContent = () => {
    if (report.type === 'REVIEW' && report.review) {
      return report.review.contentReviewed || 'Review content'
    } else if (report.type === 'EPISODE_REVIEW' && report.episodeReview) {
      return report.episodeReview.contentReviewed || 'Episode review content'
    } else if (report.type === 'REVIEW_REPLY' && replyData) {
      return replyData.content || 'Reply content'
    }
    return 'Unknown content'
  }

  const getReviewStatus = () => {
    if (report.type === 'REVIEW' && report.review) {
      return report.review.status
    } else if (report.type === 'EPISODE_REVIEW' && report.episodeReview) {
      return report.episodeReview.status
    } else if (report.type === 'REVIEW_REPLY' && replyData) {
      return replyData.status
    }
    return 'Unknown'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Report Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Report ID
            </Typography>
            <Typography variant='body1'>{report.id}</Typography>
          </Box>

          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Type
            </Typography>
            <TypeChip type={report.type} />
          </Box>

          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Status
            </Typography>
            <StatusChip status={report.status} />
          </Box>

          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Reporter
            </Typography>
            <Box>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {report.reporter?.name || report.reporter?.username || 'Unknown'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {report.reporter?.email || 'No email'}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Reason
            </Typography>
            <Typography variant='body1'>{report.reason}</Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Reported Content
            </Typography>
            {loadingReply ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                <CircularProgress size={20} />
                <Typography variant='body2'>Loading reply details...</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant='body1'>{getReportedContent()}</Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    {report.type === 'REVIEW_REPLY' ? 'Reply Status:' : 'Review Status:'}
                  </Typography>{' '}
                  <StatusChip status={getReviewStatus()} />
                </Box>
                {report.type === 'REVIEW_REPLY' && replyData && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Reply by: {replyData.name || 'Unknown'}
                    </Typography>
                    {replyData.replyCount > 0 && (
                      <Typography variant='caption' color='text.secondary' sx={{ ml: 2 }}>
                        • {replyData.replyCount} {replyData.replyCount === 1 ? 'reply' : 'replies'}
                      </Typography>
                    )}
                  </Box>
                )}
              </>
            )}
          </Box>

          <Box>
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              Created At
            </Typography>
            <Typography variant='body1'>{new Date(report.createdAt).toLocaleString()}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose}>Close</Button>
        <Button variant='outlined' onClick={onViewConversation}>
          View Conversation
        </Button>
        {report.status === 'PENDING' && (
          <>
            <Button onClick={() => onAction('approve')} variant='contained' color='success'>
              Approve
            </Button>
            <Button onClick={() => onAction('reject')} variant='contained' color='warning'>
              Reject
            </Button>
            <Button onClick={() => onAction('ban')} variant='contained' color='error'>
              Ban Content
            </Button>
          </>
        )}
        <Button onClick={() => onAction('delete')} variant='contained' color='error'>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ViewReportModal
