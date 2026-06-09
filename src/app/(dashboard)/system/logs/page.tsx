'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import SystemLogsTabs from '@components/molecules/SystemLogsTabs'
import AuditTrailTable from '@components/organisms/AuditTrailTable'
import SystemLogsTable from '@components/organisms/SystemLogsTable'
import SecurityLogsTable from '@components/organisms/SecurityLogsTable'

// Mock data
const mockAuditLogs = [
  {
    id: 1,
    userId: 1,
    userName: 'John Admin',
    action: 'UPDATE_USER',
    resource: 'User Profile',
    resourceId: 12345,
    details: 'Updated subscription plan from Basic to Premium',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-03-15T14:30:00Z',
    status: 'success'
  },
  {
    id: 2,
    userId: 2,
    userName: 'Jane Moderator',
    action: 'DELETE_CONTENT',
    resource: 'Video Content',
    resourceId: 67890,
    details: 'Removed video "Inappropriate Content" due to policy violation',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: '2024-03-15T13:45:00Z',
    status: 'success'
  },
  {
    id: 3,
    userId: 1,
    userName: 'John Admin',
    action: 'CREATE_PROMOTION',
    resource: 'Marketing Campaign',
    resourceId: 456,
    details: 'Created new promotion "Summer Sale 2024"',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: '2024-03-15T12:15:00Z',
    status: 'success'
  }
]

const mockSystemLogs = [
  {
    id: 1,
    level: 'ERROR',
    service: 'Video Streaming',
    message: 'Failed to load video chunk for content ID 12345',
    details: 'Connection timeout after 30 seconds',
    timestamp: '2024-03-15T14:35:00Z',
    resolved: false
  },
  {
    id: 2,
    level: 'WARNING',
    service: 'Payment Gateway',
    message: 'High response time detected',
    details: 'Average response time: 3.2s (threshold: 2s)',
    timestamp: '2024-03-15T14:30:00Z',
    resolved: true
  },
  {
    id: 3,
    level: 'INFO',
    service: 'Content Delivery',
    message: 'Cache refreshed successfully',
    details: 'Updated 1,245 content items in CDN cache',
    timestamp: '2024-03-15T14:00:00Z',
    resolved: true
  }
]

const mockSecurityLogs = [
  {
    id: 1,
    type: 'FAILED_LOGIN',
    severity: 'medium',
    userId: null,
    email: 'attacker@example.com',
    ipAddress: '203.0.113.195',
    location: 'Unknown Location',
    details: 'Multiple failed login attempts (5 attempts in 2 minutes)',
    timestamp: '2024-03-15T14:20:00Z',
    blocked: true
  },
  {
    id: 2,
    type: 'SUSPICIOUS_ACTIVITY',
    severity: 'high',
    userId: 12345,
    email: 'user@example.com',
    ipAddress: '198.51.100.42',
    location: 'New York, US',
    details: 'Login from new device and location',
    timestamp: '2024-03-15T13:55:00Z',
    blocked: false
  },
  {
    id: 3,
    type: 'ACCOUNT_LOCKED',
    severity: 'low',
    userId: 67890,
    email: 'locked@example.com',
    ipAddress: '192.0.2.146',
    location: 'London, UK',
    details: 'Account automatically locked after 5 failed login attempts',
    timestamp: '2024-03-15T13:30:00Z',
    blocked: true
  }
]

const SystemLogsPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [auditLogs] = useState(mockAuditLogs)
  const [systemLogs] = useState(mockSystemLogs)
  const [securityLogs] = useState(mockSecurityLogs)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const tabs = [
    {
      label: 'Audit Trail',
      content: <AuditTrailTable logs={auditLogs} onExport={() => console.log('Export audit logs')} />
    },
    {
      label: 'System Logs',
      content: (
        <SystemLogsTable
          logs={systemLogs}
          onResolve={(id: number) => console.log('Resolve log:', id)}
          onExport={() => console.log('Export system logs')}
        />
      )
    },
    {
      label: 'Security Logs',
      content: (
        <SecurityLogsTable
          logs={securityLogs}
          onBlock={(id: number) => console.log('Block IP:', id)}
          onUnblock={(id: number) => console.log('Unblock IP:', id)}
          onExport={() => console.log('Export security logs')}
        />
      )
    }
  ]

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          System Logs & Audit Trail
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Monitor system activities, security events, and administrative actions
        </Typography>
      </Box>

      {/* System Logs Tabs */}
      <SystemLogsTabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
    </Box>
  )
}

export default SystemLogsPage
