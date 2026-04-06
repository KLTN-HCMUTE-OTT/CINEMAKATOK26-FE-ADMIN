'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'

// Custom cell components
const UserActionCell = ({ log }: { log: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {log.userName}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {log.action.replace(/_/g, ' ')}
    </Typography>
  </Box>
)

const ResourceCell = ({ resource, resourceId }: { resource: string; resourceId: number }) => (
  <Box>
    <Typography variant='body2'>{resource}</Typography>
    <Typography variant='caption' color='text.secondary'>
      ID: {resourceId}
    </Typography>
  </Box>
)

const StatusCell = ({ status }: { status: string }) => (
  <Chip 
    label={status} 
    size='small' 
    color={status === 'success' ? 'success' : 'error'} 
    variant='tonal' 
  />
)

interface AuditTrailTableProps {
  logs: any[]
  onExport: () => void
}

const AuditTrailTable = ({ logs, onExport }: AuditTrailTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns: Column[] = [
    { id: 'userAction', label: 'User & Action', minWidth: 200 },
    { id: 'resource', label: 'Resource', minWidth: 150 },
    { id: 'details', label: 'Details', minWidth: 300 },
    { id: 'ipAddress', label: 'IP Address', minWidth: 130 },
    { id: 'timestamp', label: 'Timestamp', minWidth: 180 },
    { id: 'status', label: 'Status', minWidth: 100 }
  ]

  const filters = [
    {
      label: 'Action',
      key: 'action',
      options: [
        { value: 'CREATE', label: 'Create' },
        { value: 'UPDATE', label: 'Update' },
        { value: 'DELETE', label: 'Delete' },
        { value: 'LOGIN', label: 'Login' }
      ]
    },
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' }
      ]
    }
  ]

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchValue.toLowerCase()) ||
      log.action.toLowerCase().includes(searchValue.toLowerCase()) ||
      log.details.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'action') return log.action.includes(value)
      if (key === 'status') return log.status === value
      
return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      columns={columns}
      rows={filteredLogs.map(log => ({
        ...log,
        userAction: <UserActionCell log={log} />,
        resource: <ResourceCell resource={log.resource} resourceId={log.resourceId} />,
        timestamp: new Date(log.timestamp).toLocaleString(),
        status: <StatusCell status={log.status} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search audit logs...'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      actions={
        <Button variant='outlined' startIcon={<i className='ri-download-line' />} onClick={onExport}>
          Export Logs
        </Button>
      }
      emptyMessage='No audit logs found'
    />
  )
}

export default AuditTrailTable
