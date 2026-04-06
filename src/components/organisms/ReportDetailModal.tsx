'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  TextField,
  Box
} from '@mui/material'

interface ReportDetailModalProps {
  open: boolean
  onClose: () => void
  report: any
  onTakeAction: (action: 'resolve' | 'dismiss', notes?: string) => void
}

const ReportDetailModal = ({ open, onClose, report, onTakeAction }: ReportDetailModalProps) => {
  const [actionNotes, setActionNotes] = useState('')

  const handleAction = (action: 'resolve' | 'dismiss') => {
    onTakeAction(action, actionNotes)
    setActionNotes('')
    onClose()
  }

  const handleClose = () => {
    setActionNotes('')
    onClose()
  }

  if (!report) return null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogTitle>Report Details</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Content
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {report.content}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Content Type
              </Typography>
              <Chip label={report.contentType} size='small' sx={{ mb: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Report Reason
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {report.reportReason}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Priority
              </Typography>
              <Chip
                label={report.priority.toUpperCase()}
                color={report.priority === 'high' ? 'error' : report.priority === 'medium' ? 'warning' : 'default'}
                size='small'
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Description
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {report.description}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Reported By
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {report.reporterName} ({report.reportedBy})
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                Report Date
              </Typography>
              <Typography variant='body1' sx={{ mb: 2 }}>
                {report.date}
              </Typography>
            </Grid>

            {report.status === 'pending' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Action Notes (Optional)'
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  placeholder='Add notes about the action taken...'
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {report.status === 'pending' && (
          <>
            <Button color='error' onClick={() => handleAction('dismiss')}>
              Dismiss
            </Button>
            <Button variant='contained' color='success' onClick={() => handleAction('resolve')}>
              Resolve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ReportDetailModal
