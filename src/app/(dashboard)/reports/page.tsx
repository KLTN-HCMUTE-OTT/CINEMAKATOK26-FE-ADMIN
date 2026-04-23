'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusChip from '@components/reports/StatusChip'
import TypeChip from '@components/reports/TypeChip'
import ReportedContent from '@components/reports/ReportedContent'
import ReporterInfo from '@components/reports/ReporterInfo'
import ActionButtons from '@components/reports/ActionButtons'
import ReviewStatusCell from '@components/reports/ReviewStatusCell'
import ActionConfirmationDialog from '@components/reports/ActionConfirmationDialog'
import ViewReportModal from '@components/reports/ViewReportModal'
import ConversationModal from '@components/reports/ConversationModal'

// Hook Imports
import { useReports } from '@/hooks/useReports'

// API Imports
import {
  reportControllerApprove,
  reportControllerBan,
  reportControllerDelete,
  reportControllerReject
} from '@/api/reports'

const reportColumns = [
  { id: 'type', label: 'Type', minWidth: 100 },
  { id: 'reason', label: 'Reason', minWidth: 150 },
  { id: 'reportedContent', label: 'Reported Content', minWidth: 200 },
  { id: 'reporter', label: 'Reporter', minWidth: 150 },
  { id: 'reviewStatus', label: 'Review Status', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdAt', label: 'Created At', minWidth: 150 },
  { id: 'actions', label: 'Actions', minWidth: 200 }
]

const ReportsPage = () => {
  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('PENDING')

  const {
    data: reportsData,
    loading: reportsLoading,
    error: reportsError,
    totalItems,
    refetch
  } = useReports({
    limit: rowsPerPage,
    page: page + 1, // API uses 1-based pagination
    search: searchValue || undefined,
    status: statusFilter || undefined
  })

  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: 'approve' | 'ban' | 'delete' | 'reject' | null
    type?: API.BanItemDto['type']
    id?: string
  }>({ open: false, action: null })

  const [viewModal, setViewModal] = useState<{
    open: boolean
    report: API.ReportDto | null
  }>({ open: false, report: null })

  const [conversationModal, setConversationModal] = useState<{
    open: boolean
    report: API.ReportDto | null
  }>({ open: false, report: null })

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

  const handleStatusFilterChange = (value: 'PENDING' | 'APPROVED' | 'REJECTED' | '') => {
    setStatusFilter(value)
    setPage(0) // Reset to first page when filtering
  }

  const handleActionClick = (action: 'approve' | 'ban' | 'delete' | 'reject') => {
    setActionDialog({
      open: true,
      action,
      type: viewModal.report?.type,
      id: viewModal.report?.id || ''
    })
  }

  const handleActionConfirm = async () => {
    if (!actionDialog.action || !actionDialog.id) return

    try {
      switch (actionDialog.action) {
        case 'approve':
          await reportControllerApprove({ id: actionDialog.id })
          break
        case 'ban': {
          const targetId = viewModal.report?.targetId

          if (!actionDialog.type || !targetId) return

          await reportControllerBan({ type: actionDialog.type, id: targetId })
          break
        }
        case 'reject':
          await reportControllerReject({ id: actionDialog.id })
          break
        case 'delete':
          await reportControllerDelete({ id: actionDialog.id })
          break
      }
      refetch() // Refresh the data
      handleViewModalClose()
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionDialog({ open: false, action: null })
    }
  }

  const handleActionCancel = () => {
    setActionDialog({ open: false, action: null })
  }

  const handleViewReport = (reportId: string) => {
    const report = reportsData.find(r => r.id === reportId)
    if (report) {
      setViewModal({ open: true, report })
    }
  }

  const handleViewModalClose = () => {
    setViewModal({ open: false, report: null })
  }

  const handleViewConversation = () => {
    if (viewModal.report) {
      setConversationModal({ open: true, report: viewModal.report })
      handleViewModalClose()
    }
  }

  const handleConversationModalClose = () => {
    setConversationModal({ open: false, report: null })
  }

  const formattedReportsData = reportsData.map((report: API.ReportDto) => {
    return {
      type: <TypeChip type={report.type} />,
      reason: report.reason || 'No reason provided',
      reportedContent: <ReportedContent report={report} />,
      reporter: <ReporterInfo reporter={report.reporter} />,
      reviewStatus: <ReviewStatusCell report={report} />,
      status: <StatusChip status={report.status || 'PENDING'} />,
      createdAt: new Date(report.createdAt).toLocaleString(),
      actions: <ActionButtons reportId={report.id} onView={handleViewReport} />
    }
  })

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Reports Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review and manage user reports for content moderation
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Filters */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label='Status Filter'
                onChange={e => handleStatusFilterChange(e.target.value as 'PENDING' | 'APPROVED' | 'REJECTED' | '')}
              >
                <MenuItem value=''>All Status</MenuItem>
                <MenuItem value='PENDING'>Pending</MenuItem>
                <MenuItem value='APPROVED'>Approved</MenuItem>
                <MenuItem value='REJECTED'>Rejected</MenuItem>
              </Select>
            </FormControl>
            {(searchValue || statusFilter !== 'PENDING') && (
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  setSearchValue('')
                  setStatusFilter('PENDING')
                  setPage(0)
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Grid>

        {/* Reports Table */}
        <Grid item xs={12}>
          <DataTable
            columns={reportColumns}
            rows={formattedReportsData}
            totalCount={totalItems}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            searchable={false}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder='Search reports...'
            emptyMessage={reportsError ? `Error: ${reportsError}` : 'No reports found'}
            loading={reportsLoading}
          />
        </Grid>
      </Grid>

      {/* Action Confirmation Dialog */}
      <ActionConfirmationDialog
        open={actionDialog.open}
        action={actionDialog.action}
        onClose={handleActionCancel}
        onConfirm={handleActionConfirm}
      />

      {/* View Report Modal */}
      <ViewReportModal
        open={viewModal.open}
        report={viewModal.report}
        onClose={handleViewModalClose}
        onAction={handleActionClick}
        onViewConversation={handleViewConversation}
      />

      {/* Conversation Modal */}
      <ConversationModal
        open={conversationModal.open}
        report={conversationModal.report}
        onClose={handleConversationModalClose}
      />
    </Box>
  )
}

export default ReportsPage
