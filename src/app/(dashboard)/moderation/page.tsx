'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import ModerationStats from '@components/organisms/ModerationStats'
import ModerationTable from '@components/organisms/ModerationTable'
import ReportDetailModal from '@components/organisms/ReportDetailModal'

// Mock data for reports
const mockReports = [
  {
    id: 1,
    content: 'Stranger Things - Episode 5',
    contentType: 'Episode',
    reportReason: 'Inappropriate Content',
    reportedBy: 'john.doe@email.com',
    reporterName: 'John Doe',
    date: '2024-03-10',
    status: 'pending',
    description: 'Contains violent scenes not suitable for the age rating',
    priority: 'high'
  },
  {
    id: 2,
    content: 'The Matrix',
    contentType: 'Movie',
    reportReason: 'Copyright Issue',
    reportedBy: 'jane.smith@email.com',
    reporterName: 'Jane Smith',
    date: '2024-03-09',
    status: 'pending',
    description: 'Suspected unauthorized use of copyrighted music',
    priority: 'medium'
  },
  {
    id: 3,
    content: 'Breaking Bad - Season 2',
    contentType: 'Series',
    reportReason: 'Quality Issue',
    reportedBy: 'mike.johnson@email.com',
    reporterName: 'Mike Johnson',
    date: '2024-03-08',
    status: 'resolved',
    description: 'Poor video quality and audio sync issues',
    priority: 'low'
  },
  {
    id: 4,
    content: 'User Review - Inception',
    contentType: 'Review',
    reportReason: 'Spam',
    reportedBy: 'sarah.wilson@email.com',
    reporterName: 'Sarah Wilson',
    date: '2024-03-07',
    status: 'dismissed',
    description: 'Multiple fake reviews from same user',
    priority: 'medium'
  }
]

const ModerationPage = () => {
  const [reports, setReports] = useState(mockReports)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setDetailModalOpen(true)
  }

  const handleResolveReport = (id: number) => {
    setReports(prev => prev.map(report => (report.id === id ? { ...report, status: 'resolved' as const } : report)))
  }

  const handleDismissReport = (id: number) => {
    setReports(prev => prev.map(report => (report.id === id ? { ...report, status: 'dismissed' as const } : report)))
  }

  const handleTakeAction = (action: 'resolve' | 'dismiss', notes?: string) => {
    if (!selectedReport) return

    console.log('Taking action:', action, 'with notes:', notes)

    setReports(prev =>
      prev.map(report =>
        report.id === selectedReport.id
          ? { ...report, status: action === 'resolve' ? ('resolved' as const) : ('dismissed' as const) }
          : report
      )
    )

    setDetailModalOpen(false)
    setSelectedReport(null)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Content Moderation
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Review and manage content reports and violations
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Box sx={{ mb: 4 }}>
        <ModerationStats reports={reports} />
      </Box>

      {/* Data Table */}
      <ModerationTable
        reports={reports}
        onViewReport={handleViewReport}
        onResolveReport={handleResolveReport}
        onDismissReport={handleDismissReport}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        report={selectedReport}
        onTakeAction={handleTakeAction}
      />
    </Box>
  )
}

export default ModerationPage
