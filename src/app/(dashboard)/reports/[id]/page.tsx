'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import Alert from '@mui/material/Alert'

// API Imports
import {
  reportControllerFindOne,
  reportControllerApprove,
  reportControllerBan,
  reportControllerDelete
} from '@/api/reports'

const ReportDetailPage = () => {
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<API.ReportDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: 'approve' | 'ban' | 'delete' | null
  }>({ open: false, action: null })

  const fetchReportDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await reportControllerFindOne({ id: reportId })

      if (response.data) {
        setReport(response.data.data || response.data)
      } else {
        setError('Report not found')
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch report details'

      setError(errorMessage)
      console.error('Error fetching report details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (reportId) {
      fetchReportDetail()
    }
  }, [reportId])

  const handleActionClick = (action: 'approve' | 'ban' | 'delete') => {
    setActionDialog({ open: true, action })
  }

  const handleActionConfirm = async () => {
    if (!actionDialog.action || !report) return

    try {
      switch (actionDialog.action) {
        case 'approve':
          await reportControllerApprove({ id: report.id })
          break
        case 'ban':
          await reportControllerBan({ type: report.type, id: report.targetId })
          break
        case 'delete':
          await reportControllerDelete({ id: report.id })
          break
      }


      // Refresh the report data
      fetchReportDetail()
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionDialog({ open: false, action: null })
    }
  }

  const handleActionCancel = () => {
    setActionDialog({ open: false, action: null })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'banned':
        return 'error'
      case 'resolved':
        return 'info'
      default:
        return 'default'
    }
  }

  const getActionDialogTitle = () => {
    switch (actionDialog.action) {
      case 'approve':
        return 'Approve Report'
      case 'ban':
        return 'Ban Item'
      case 'delete':
        return 'Delete Report'
      default:
        return 'Confirm Action'
    }
  }

  const getActionDialogMessage = () => {
    if (!report) return ''

    switch (actionDialog.action) {
      case 'approve':
        return `Are you sure you want to approve this ${report.type}?`
      case 'ban':
        return `Are you sure you want to ban this ${report.type}?`
      case 'delete':
        return 'Are you sure you want to delete this report?'
      default:
        return 'Are you sure you want to perform this action?'
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant='body1'>Loading report details...</Typography>
      </Box>
    )
  }

  if (error || !report) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error || 'Report not found'}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Report Details
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review detailed information about this report
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Report Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant='h6' component='h2' sx={{ mb: 3 }}>
                Report Information
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Report ID
                </Typography>
                <Typography variant='body1'>{report.id}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Type
                </Typography>
                <Typography variant='body1'>{report.type || 'Unknown'}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Reason
                </Typography>
                <Typography variant='body1'>{report.reason || 'No reason provided'}</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Reporter
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {report.reporter.name || 'Unknown'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {report.reporter.email || 'No email provided'}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Reported Content
                </Typography>
                {report.type === 'REVIEW' && report.review && (
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      Review Content:
                    </Typography>
                    <Typography variant='body1' sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      "{report.review.contentReviewed}"
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Rating: {report.review.rating}/5 • By: {report.review.name}
                    </Typography>
                  </Box>
                )}
                {report.type === 'EPISODE_REVIEW' && report.episodeReview && (
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                      Episode Review Content:
                    </Typography>
                    <Typography variant='body1' sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      "{report.episodeReview.contentReviewed}"
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      By: {report.episodeReview.name}
                    </Typography>
                  </Box>
                )}
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  Target ID: {report.targetId}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                  Created At
                </Typography>
                <Typography variant='body1'>{new Date(report.createdAt).toLocaleString()}</Typography>
              </Box>

              {report.details && Object.keys(report.details).length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                      Additional Details
                    </Typography>
                    <Typography variant='body1'>{JSON.stringify(report.details, null, 2)}</Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' component='h2' sx={{ mb: 3 }}>
                Actions
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant='contained' color='success' fullWidth onClick={() => handleActionClick('approve')}>
                  Approve Item
                </Button>

                <Button variant='contained' color='error' fullWidth onClick={() => handleActionClick('ban')}>
                  Ban Item
                </Button>

                <Button variant='outlined' color='secondary' fullWidth onClick={() => handleActionClick('delete')}>
                  Delete Report
                </Button>
              </Box>
            </CardContent>
          </Card>
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
    </Box>
  )
}

export default ReportDetailPage
