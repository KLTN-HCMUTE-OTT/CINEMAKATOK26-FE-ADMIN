'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Components Imports
import DataTable from '@components/shared/DataTable'
import ConversationModal from '@components/reports/ConversationModal'

// Hook Imports
import { useReviews } from '@/hooks/useReviews'

// API Imports
import { reviewControllerDeleteReview } from '@/api/review'
import { episodeReviewControllerDeleteReview } from '@/api/episodeReviews'
import { reportControllerBan, reportControllerUnban } from '@/api/reports'
import { reviewReplyControllerDeleteReply } from '@/api/reviewReplies'

const reviewColumns = [
  { id: 'type', label: 'Type', minWidth: 120 },
  { id: 'content', label: 'Content', minWidth: 300 },
  { id: 'rating', label: 'Rating', minWidth: 100 },
  { id: 'author', label: 'Author', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdAt', label: 'Created At', minWidth: 150 },
  { id: 'actions', label: 'Actions', minWidth: 200 }
]

const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success'
      case 'banned':
        return 'error'
      default:
        return 'default'
    }
  }

  return <Chip label={status} color={getStatusColor(status)} size='small' variant='outlined' />
}

const ReviewsPage = () => {
  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'BANNED'>('ACTIVE')
  const [typeFilter, setTypeFilter] = useState<'REVIEW' | 'EPISODE_REVIEW' | 'REVIEW_REPLY'>('REVIEW')

  const {
    data: reviewsData,
    loading: reviewsLoading,
    error: reviewsError,
    totalItems,
    refetch
  } = useReviews({
    limit: rowsPerPage,
    page: page + 1, // API uses 1-based pagination
    search: searchValue || undefined,
    status: statusFilter,
    type: typeFilter,
    sort: typeFilter === 'REVIEW_REPLY' ? JSON.stringify({ createdAt: 'DESC' }) : undefined
  })

  const [selectedReview, setSelectedReview] = useState<any>(null)

  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: 'ban' | 'unban' | 'delete' | null
    type?: API.BanItemDto['type']
    id?: string
  }>({ open: false, action: null })

  const [viewModal, setViewModal] = useState<{
    open: boolean
    review: any
  }>({ open: false, review: null })

  const [conversationModal, setConversationModal] = useState<{
    open: boolean
    review: any
  }>({ open: false, review: null })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setPage(0) // Reset to first page when searching
  }

  const handleStatusFilterChange = (value: 'ACTIVE' | 'BANNED') => {
    setStatusFilter(value)
    setPage(0) // Reset to first page when filtering
  }

  const handleTypeFilterChange = (value: 'REVIEW' | 'EPISODE_REVIEW' | 'REVIEW_REPLY') => {
    setTypeFilter(value)
    setPage(0) // Reset to first page when filtering
  }

  const handleActionConfirm = async () => {
    if (!actionDialog.action || !actionDialog.type || !actionDialog.id) return

    try {
      switch (actionDialog.action) {
        case 'ban':
          await reportControllerBan({
            type: actionDialog.type,
            id: actionDialog.id
          })
          break
        case 'unban':
          await reportControllerUnban({
            type: actionDialog.type,
            id: actionDialog.id
          })
          break
        case 'delete':
          if (actionDialog.type === 'EPISODE_REVIEW') {
            await episodeReviewControllerDeleteReview({ id: actionDialog.id })
          } else {
            await reviewControllerDeleteReview({ id: actionDialog.id })
          }

          break
      }

      refetch() // Refresh the data
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionDialog({ open: false, action: null })
      setSelectedReview(null)
    }
  }

  const handleActionCancel = () => {
    setActionDialog({ open: false, action: null })
    setSelectedReview(null)
  }

  const handleViewReview = (review: any) => {
    setViewModal({ open: true, review })
  }

  const handleViewModalClose = () => {
    setViewModal({ open: false, review: null })
  }

  const handleViewConversation = (review: any) => {
    // Tạo report object giống như reports page để dùng chung ConversationModal
    const reportLikeObject = {
      type: review.type,
      targetId: review.id,
      review: review.type === 'REVIEW' ? review : undefined,
      episodeReview: review.type === 'EPISODE_REVIEW' ? review : undefined
    }

    setConversationModal({ open: true, review: reportLikeObject })
  }

  const handleConversationModalClose = () => {
    setConversationModal({ open: false, review: null })
  }

  const handleReplyAction = async (action: 'ban' | 'unban', replyId: string) => {
    try {
      if (action === 'ban') {
        await reportControllerBan({
          type: 'REVIEW_REPLY',
          id: replyId
        })
      } else {
        await reportControllerUnban({
          type: 'REVIEW_REPLY',
          id: replyId
        })
      }

      refetch()
    } catch (error) {
      console.error(`Error ${action}ning reply:`, error)
    }
  }

  const formattedReviewsData = reviewsData.map((review: any) => ({
    type: (
      <Chip
        label={
          review.type === 'REVIEW'
            ? 'Movie Review'
            : review.type === 'EPISODE_REVIEW'
              ? 'Episode Review'
              : review.type === 'REVIEW_REPLY'
                ? 'Review Reply'
                : 'Unknown'
        }
        size='small'
        color='info'
        variant='outlined'
      />
    ),
    content: (
      <Box>
        <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
          {review.type === 'REVIEW_REPLY' ? review.content : review.contentReviewed}
        </Typography>
        {review.rating && (
          <Typography variant='caption' color='text.secondary'>
            Rating: {review.rating}/5 stars
          </Typography>
        )}
      </Box>
    ),
    rating: review.type === 'REVIEW_REPLY' ? 'N/A' : review.rating ? `${review.rating}/5` : 'N/A',
    author: (
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {review.name}
      </Typography>
    ),
    status: <StatusChip status={review.status || 'ACTIVE'} />,
    createdAt: new Date(review.createdAt).toLocaleString(),
    actions: (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button size='small' variant='outlined' color='info' onClick={() => handleViewReview(review)}>
          View
        </Button>
      </Box>
    )
  }))

  const getActionDialogTitle = () => {
    switch (actionDialog.action) {
      case 'ban':
        return 'Ban Review'
      case 'unban':
        return 'Unban Review'
      case 'delete':
        return 'Delete Review'
      default:
        return 'Confirm Action'
    }
  }

  const getActionDialogMessage = () => {
    if (!selectedReview) return ''

    switch (actionDialog.action) {
      case 'ban':
        return `Are you sure you want to ban this ${selectedReview.type.toLowerCase()}?`
      case 'unban':
        return `Are you sure you want to unban this ${selectedReview.type.toLowerCase()}?`
      case 'delete':
        return 'Are you sure you want to delete this review?'
      default:
        return 'Are you sure you want to perform this action?'
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Reviews Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review and manage all user reviews and episode reviews
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Filters */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Type Filter</InputLabel>
              <Select
                value={typeFilter}
                label='Type Filter'
                onChange={e => handleTypeFilterChange(e.target.value as 'REVIEW' | 'EPISODE_REVIEW' | 'REVIEW_REPLY')}
              >
                <MenuItem value='REVIEW'>Movie Reviews</MenuItem>
                <MenuItem value='EPISODE_REVIEW'>Episode Reviews</MenuItem>
                <MenuItem value='REVIEW_REPLY'>Review Replies</MenuItem>
              </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label='Status Filter'
                onChange={e => handleStatusFilterChange(e.target.value as 'ACTIVE' | 'BANNED')}
              >
                <MenuItem value='ACTIVE'>Active</MenuItem>
                <MenuItem value='BANNED'>Banned</MenuItem>
              </Select>
            </FormControl>
            {(searchValue || statusFilter !== 'ACTIVE' || typeFilter !== 'REVIEW') && (
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  setSearchValue('')
                  setStatusFilter('ACTIVE')
                  setTypeFilter('REVIEW')
                  setPage(0)
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Grid>

        {/* Reviews Table */}
        <Grid item xs={12}>
          <DataTable
            rows={formattedReviewsData}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            emptyMessage={reviewsError ? `Error: ${reviewsError}` : 'No reviews found'}
            loading={reviewsLoading}
          >
            <DataTable.Toolbar>
              <DataTable.Search placeholder='Search reviews...' />
            </DataTable.Toolbar>
            {reviewColumns.map(column => (
              <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
            ))}
            <DataTable.Pagination
              totalCount={totalItems}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </DataTable>
        </Grid>
      </Grid>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={handleActionCancel}
        aria-labelledby='action-dialog-title'
        aria-describedby='action-dialog-description'
      >
        <DialogTitle id='action-dialog-title'>{getActionDialogTitle()}</DialogTitle>
        <DialogContent>
          <DialogContentText id='action-dialog-description'>{getActionDialogMessage()}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionCancel} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleActionConfirm} color='primary' variant='contained'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Review Modal */}
      <Dialog
        open={viewModal.open}
        onClose={handleViewModalClose}
        maxWidth='md'
        fullWidth
        aria-labelledby='view-review-dialog-title'
      >
        <DialogTitle id='view-review-dialog-title'>Review Details</DialogTitle>
        <DialogContent>
          {viewModal.review && (
            <Box>
              {/* Review ID */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Review ID
                </Typography>
                <Typography variant='body1' sx={{ fontFamily: 'monospace' }}>
                  {viewModal.review.id}
                </Typography>
              </Box>

              {/* Type */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Type
                </Typography>
                <Chip
                  label={
                    viewModal.review.type === 'REVIEW'
                      ? 'Movie Review'
                      : viewModal.review.type === 'EPISODE_REVIEW'
                        ? 'Episode Review'
                        : 'Review Reply'
                  }
                  size='small'
                  color='info'
                  variant='outlined'
                />
              </Box>

              {/* Content */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Content
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  "
                  {viewModal.review.type === 'REVIEW_REPLY'
                    ? viewModal.review.content
                    : viewModal.review.contentReviewed}
                  "
                </Typography>
                {viewModal.review.rating && viewModal.review.type !== 'REVIEW_REPLY' && (
                  <Typography variant='body2' color='text.secondary'>
                    Rating: {viewModal.review.rating}/5 stars
                  </Typography>
                )}
              </Box>

              {/* Author */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Author
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {viewModal.review.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  User ID: {viewModal.review.userId}
                </Typography>
              </Box>

              {/* Status */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Status
                </Typography>
                <StatusChip status={viewModal.review.status || 'ACTIVE'} />
              </Box>

              {/* Created At */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Created At
                </Typography>
                <Typography variant='body1'>{new Date(viewModal.review.createdAt).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewModalClose} color='inherit'>
            Close
          </Button>
          {viewModal.review && (
            <Button
              variant='outlined'
              onClick={() => {
                handleViewConversation(viewModal.review)
                handleViewModalClose()
              }}
            >
              View Conversation
            </Button>
          )}
          {viewModal.review && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {viewModal.review.status === 'ACTIVE' ? (
                <Button
                  variant='outlined'
                  color='error'
                  onClick={async () => {
                    try {
                      await reportControllerBan({
                        type: viewModal.review.type,
                        id: viewModal.review.id
                      })
                      refetch()
                      handleViewModalClose()
                    } catch (error) {
                      console.error('Error banning review:', error)
                    }
                  }}
                >
                  Ban
                </Button>
              ) : (
                <Button
                  variant='outlined'
                  color='success'
                  onClick={async () => {
                    try {
                      await reportControllerUnban({
                        type: viewModal.review.type,
                        id: viewModal.review.id
                      })
                      refetch()
                      handleViewModalClose()
                    } catch (error) {
                      console.error('Error unbanning review:', error)
                    }
                  }}
                >
                  Unban
                </Button>
              )}
              <Button
                variant='outlined'
                color='secondary'
                onClick={async () => {
                  try {
                    if (viewModal.review.type === 'EPISODE_REVIEW') {
                      await episodeReviewControllerDeleteReview({ id: viewModal.review.id })
                    } else if (viewModal.review.type === 'REVIEW_REPLY') {
                      await reviewReplyControllerDeleteReply({ id: viewModal.review.id })
                    } else {
                      await reviewControllerDeleteReview({ id: viewModal.review.id })
                    }

                    refetch()
                    handleViewModalClose()
                  } catch (error) {
                    console.error('Error deleting review:', error)
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Conversation Modal */}
      <ConversationModal
        open={conversationModal.open}
        report={conversationModal.review}
        onClose={handleConversationModalClose}
        isReportContext={false}
        onReplyAction={handleReplyAction}
      />
    </Box>
  )
}

export default ReviewsPage
