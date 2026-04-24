'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Chip, IconButton, Avatar } from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Custom cell components
const ContentCell = ({ content, contentType }: { content: string; contentType: string }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {content}
    </Typography>
    <Chip label={contentType} size='small' variant='outlined' sx={{ mt: 0.5 }} />
  </Box>
)

const ReasonCell = ({ reason }: { reason: string }) => (
  <Chip
    label={reason}
    size='small'
    variant='tonal'
    color={
      reason.includes('Copyright')
        ? 'error'
        : reason.includes('Inappropriate')
          ? 'warning'
          : reason.includes('Quality')
            ? 'info'
            : 'default'
    }
  />
)

const ReporterCell = ({ reportedBy, reporterName }: { reportedBy: string; reporterName: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{reporterName.charAt(0)}</Avatar>
    <Box>
      <Typography variant='body2'>{reporterName}</Typography>
      <Typography variant='caption' color='text.secondary'>
        {reportedBy}
      </Typography>
    </Box>
  </Box>
)

const PriorityCell = ({ priority }: { priority: string }) => (
  <Chip
    label={priority.toUpperCase()}
    size='small'
    color={priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'default'}
  />
)

const ActionsCell = ({
  report,
  onView,
  onResolve,
  onDismiss
}: {
  report: any
  onView: (report: any) => void
  onResolve: (id: number) => void
  onDismiss: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onView(report)}>
      <i className='ri-eye-line' />
    </IconButton>
    {report.status === 'pending' && (
      <>
        <IconButton size='small' color='success' onClick={() => onResolve(report.id)}>
          <i className='ri-check-line' />
        </IconButton>
        <IconButton size='small' color='error' onClick={() => onDismiss(report.id)}>
          <i className='ri-close-line' />
        </IconButton>
      </>
    )}
  </Box>
)

interface ModerationTableProps {
  reports: any[]
  onViewReport: (report: any) => void
  onResolveReport: (id: number) => void
  onDismissReport: (id: number) => void
}

const ModerationTable = ({ reports, onViewReport, onResolveReport, onDismissReport }: ModerationTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns = [
    { id: 'content', label: 'Content', minWidth: 200 },
    { id: 'reportReason', label: 'Reason', minWidth: 150 },
    { id: 'reportedBy', label: 'Reported By', minWidth: 200 },
    { id: 'priority', label: 'Priority', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 150 }
  ]

  const filters = [
    {
      label: 'Reason',
      key: 'reason',
      options: [
        { value: 'inappropriate', label: 'Inappropriate Content' },
        { value: 'copyright', label: 'Copyright Issue' },
        { value: 'quality', label: 'Quality Issue' },
        { value: 'spam', label: 'Spam' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' }
      ]
    },
    {
      label: 'Priority',
      key: 'priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    }
  ]

  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.content.toLowerCase().includes(searchValue.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchValue.toLowerCase()) ||
      report.reportReason.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'reason') return report.reportReason.toLowerCase().includes(value)
      if (key === 'status') return report.status === value
      if (key === 'priority') return report.priority === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      rows={filteredReports.map(report => ({
        ...report,
        content: <ContentCell content={report.content} contentType={report.contentType} />,
        reportReason: <ReasonCell reason={report.reportReason} />,
        reportedBy: <ReporterCell reportedBy={report.reportedBy} reporterName={report.reporterName} />,
        priority: <PriorityCell priority={report.priority} />,
        status: <StatusBadge status={report.status as any} />,
        actions: (
          <ActionsCell report={report} onView={onViewReport} onResolve={onResolveReport} onDismiss={onDismissReport} />
        )
      }))}
      searchValue={searchValue}
      searchable={false}
      onSearchChange={setSearchValue}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      emptyMessage='No reports found'
    >
      <DataTable.Toolbar>
        <DataTable.Filters />
      </DataTable.Toolbar>
      {columns.map(column => (
        <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
      ))}
    </DataTable>
  )
}

export default ModerationTable
