'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'

// Custom cell components
const LogLevelCell = ({ level }: { level: string }) => {
  const getColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'error'
      case 'WARNING':
        return 'warning'
      case 'INFO':
        return 'info'
      default:
        return 'default'
    }
  }

  return <Chip label={level} size='small' color={getColor(level)} variant='tonal' />
}

const ServiceMessageCell = ({ service, message }: { service: string; message: string }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {service}
    </Typography>
    <Typography variant='caption' color='text.secondary' noWrap>
      {message}
    </Typography>
  </Box>
)

const ResolvedCell = ({
  resolved,
  onResolve,
  id
}: {
  resolved: boolean
  onResolve: (id: number) => void
  id: number
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Chip label={resolved ? 'Resolved' : 'Open'} size='small' color={resolved ? 'success' : 'error'} variant='tonal' />
    {!resolved && (
      <IconButton size='small' onClick={() => onResolve(id)} title='Mark as resolved'>
        <i className='ri-check-line' />
      </IconButton>
    )}
  </Box>
)

interface SystemLogsTableProps {
  logs: any[]
  onResolve: (id: number) => void
  onExport: () => void
}

const SystemLogsTable = ({ logs, onResolve, onExport }: SystemLogsTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns = [
    { id: 'level', label: 'Level', minWidth: 100 },
    { id: 'serviceMessage', label: 'Service & Message', minWidth: 300 },
    { id: 'details', label: 'Details', minWidth: 250 },
    { id: 'timestamp', label: 'Timestamp', minWidth: 180 },
    { id: 'resolved', label: 'Status', minWidth: 150 }
  ]

  const filters = [
    {
      label: 'Level',
      key: 'level',
      options: [
        { value: 'ERROR', label: 'Error' },
        { value: 'WARNING', label: 'Warning' },
        { value: 'INFO', label: 'Info' }
      ]
    },
    {
      label: 'Status',
      key: 'resolved',
      options: [
        { value: 'false', label: 'Open' },
        { value: 'true', label: 'Resolved' }
      ]
    }
  ]

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.service.toLowerCase().includes(searchValue.toLowerCase()) ||
      log.message.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'level') return log.level === value
      if (key === 'resolved') return log.resolved.toString() === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      rows={filteredLogs.map(log => ({
        ...log,
        level: <LogLevelCell level={log.level} />,
        serviceMessage: <ServiceMessageCell service={log.service} message={log.message} />,
        timestamp: new Date(log.timestamp).toLocaleString(),
        resolved: <ResolvedCell resolved={log.resolved} onResolve={onResolve} id={log.id} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      emptyMessage='No system logs found'
    >
      <DataTable.Toolbar>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <DataTable.Search placeholder='Search system logs...' />
            <DataTable.Filters />
          </div>
          <Button variant='outlined' startIcon={<i className='ri-download-line' />} onClick={onExport}>
            Export Logs
          </Button>
        </div>
      </DataTable.Toolbar>
      {columns.map(column => (
        <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
      ))}
    </DataTable>
  )
}

export default SystemLogsTable
