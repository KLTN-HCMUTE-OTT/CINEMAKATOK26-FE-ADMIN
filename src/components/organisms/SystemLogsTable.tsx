'use client'

// React Imports
import { useCallback, useMemo, useState } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'

import { useDebounce } from '@/hooks/useDebounce'

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

  const debouncedSearch = useDebounce(searchValue, 400)

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }))
  }, [])

  const filteredLogs = useMemo(
    () =>
      logs.filter(log => {
        const search = debouncedSearch.toLowerCase()
        const matchesSearch = log.service.toLowerCase().includes(search) || log.message.toLowerCase().includes(search)

        const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
          if (!value) return true
          if (key === 'level') return log.level === value
          if (key === 'resolved') return log.resolved.toString() === value

          return true
        })

        return matchesSearch && matchesFilters
      }),
    [logs, debouncedSearch, filterValues]
  )

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'level',
        headerName: 'Level',
        minWidth: 120,
        flex: 0.5,
        sortable: false,
        renderCell: params => <LogLevelCell level={params.row.level} />
      },
      {
        field: 'serviceMessage',
        headerName: 'Service & Message',
        minWidth: 320,
        flex: 1.5,
        sortable: false,
        renderCell: params => <ServiceMessageCell service={params.row.service} message={params.row.message} />
      },
      {
        field: 'details',
        headerName: 'Details',
        minWidth: 260,
        flex: 1,
        sortable: false
      },
      {
        field: 'timestamp',
        headerName: 'Timestamp',
        minWidth: 180,
        flex: 0.8,
        valueFormatter: params => new Date(params.value as string).toLocaleString()
      },
      {
        field: 'resolved',
        headerName: 'Status',
        minWidth: 170,
        flex: 0.8,
        sortable: false,
        renderCell: params => <ResolvedCell resolved={params.row.resolved} onResolve={onResolve} id={params.row.id} />
      }
    ],
    [onResolve]
  )

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Search system logs...'
            value={searchValue}
            onChange={event => setSearchValue(event.target.value)}
            sx={{ minWidth: 240 }}
          />

          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={filterValues.level || ''}
              label='Level'
              onChange={event => handleFilterChange('level', event.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='ERROR'>Error</MenuItem>
              <MenuItem value='WARNING'>Warning</MenuItem>
              <MenuItem value='INFO'>Info</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterValues.resolved || ''}
              label='Status'
              onChange={event => handleFilterChange('resolved', event.target.value)}
            >
              <MenuItem value=''>All</MenuItem>
              <MenuItem value='false'>Open</MenuItem>
              <MenuItem value='true'>Resolved</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button variant='outlined' startIcon={<i className='ri-download-line' />} onClick={onExport}>
          Export Logs
        </Button>
      </Box>

      <Box sx={{ height: 560 }}>
        <DataGrid
          rows={filteredLogs}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25
              }
            }
          }}
          sx={{ border: 0 }}
        />
      </Box>
    </Box>
  )
}

export default SystemLogsTable
