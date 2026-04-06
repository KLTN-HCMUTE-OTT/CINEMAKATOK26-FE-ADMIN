'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'

// Custom cell components
const SecurityTypeCell = ({ type, severity }: { type: string; severity: string }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {type.replace(/_/g, ' ')}
      </Typography>
      <Chip label={severity} size='small' color={getSeverityColor(severity)} variant='tonal' sx={{ mt: 0.5 }} />
    </Box>
  )
}

const UserInfoCell = ({ email, location }: { email: string; location: string }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {email}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {location}
    </Typography>
  </Box>
)

const BlockStatusCell = ({
  blocked,
  onBlock,
  onUnblock,
  id
}: {
  blocked: boolean
  onBlock: (id: number) => void
  onUnblock: (id: number) => void
  id: number
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Chip label={blocked ? 'Blocked' : 'Active'} size='small' color={blocked ? 'error' : 'success'} variant='tonal' />
    {blocked ? (
      <IconButton size='small' onClick={() => onUnblock(id)} title='Unblock'>
        <i className='ri-shield-check-line' />
      </IconButton>
    ) : (
      <IconButton size='small' color='error' onClick={() => onBlock(id)} title='Block'>
        <i className='ri-shield-cross-line' />
      </IconButton>
    )}
  </Box>
)

interface SecurityLogsTableProps {
  logs: any[]
  onBlock: (id: number) => void
  onUnblock: (id: number) => void
  onExport: () => void
}

const SecurityLogsTable = ({ logs, onBlock, onUnblock, onExport }: SecurityLogsTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns: Column[] = [
    { id: 'securityType', label: 'Type & Severity', minWidth: 180 },
    { id: 'userInfo', label: 'User & Location', minWidth: 250 },
    { id: 'ipAddress', label: 'IP Address', minWidth: 130 },
    { id: 'details', label: 'Details', minWidth: 300 },
    { id: 'timestamp', label: 'Timestamp', minWidth: 180 },
    { id: 'blockStatus', label: 'Status', minWidth: 150 }
  ]

  const filters = [
    {
      label: 'Type',
      key: 'type',
      options: [
        { value: 'FAILED_LOGIN', label: 'Failed Login' },
        { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
        { value: 'ACCOUNT_LOCKED', label: 'Account Locked' }
      ]
    },
    {
      label: 'Severity',
      key: 'severity',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    },
    {
      label: 'Status',
      key: 'blocked',
      options: [
        { value: 'true', label: 'Blocked' },
        { value: 'false', label: 'Active' }
      ]
    }
  ]

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      log.ipAddress.includes(searchValue) ||
      log.details.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'type') return log.type === value
      if (key === 'severity') return log.severity === value
      if (key === 'blocked') return log.blocked.toString() === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      columns={columns}
      rows={filteredLogs.map(log => ({
        ...log,
        securityType: <SecurityTypeCell type={log.type} severity={log.severity} />,
        userInfo: <UserInfoCell email={log.email} location={log.location} />,
        timestamp: new Date(log.timestamp).toLocaleString(),
        blockStatus: <BlockStatusCell blocked={log.blocked} onBlock={onBlock} onUnblock={onUnblock} id={log.id} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search security logs...'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      actions={
        <Button variant='outlined' startIcon={<i className='ri-download-line' />} onClick={onExport}>
          Export Logs
        </Button>
      }
      emptyMessage='No security logs found'
    />
  )
}

export default SecurityLogsTable
