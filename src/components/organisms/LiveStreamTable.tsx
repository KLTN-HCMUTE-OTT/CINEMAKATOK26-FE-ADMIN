'use client'

// React Imports
import { useState } from 'react'

import { Box, Typography, Button, IconButton, Avatar, Chip } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const StreamInfoCell = ({ stream }: { stream: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Avatar
      src={stream.thumbnail}
      alt={stream.title}
      sx={{ width: 56, height: 40, borderRadius: 1 }}
      variant='rounded'
    />
    <Box>
      <Typography variant='body2' sx={{ fontWeight: 500 }} noWrap>
        {stream.title}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {stream.streamer}
      </Typography>
    </Box>
  </Box>
)

const ViewersCell = ({ value, status }: { value: number; status: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {status === 'live' ? formatNumber(value) : '-'}
    </Typography>
    {status === 'live' && (
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'error.main',
          animation: 'pulse 2s infinite'
        }}
      />
    )}
  </Box>
)

const QualityCell = ({ quality, bitrate }: { quality: string; bitrate: string }) => (
  <Box>
    <Chip label={quality} size='small' color='primary' variant='outlined' />
    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
      {bitrate}
    </Typography>
  </Box>
)

const StreamActionsCell = ({
  stream,
  onStart,
  onStop,
  onEdit,
  onDelete
}: {
  stream: any
  onStart: (id: number) => void
  onStop: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    {stream.status === 'scheduled' && (
      <IconButton size='small' color='success' onClick={() => onStart(stream.id)}>
        <i className='ri-play-line' />
      </IconButton>
    )}
    {stream.status === 'live' && (
      <IconButton size='small' color='error' onClick={() => onStop(stream.id)}>
        <i className='ri-stop-line' />
      </IconButton>
    )}
    <IconButton size='small' onClick={() => onEdit(stream.id)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(stream.id)}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface LiveStreamTableProps {
  streams: any[]
  onStart: (id: number) => void
  onStop: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onAddStream: () => void
}

const LiveStreamTable = ({ streams, onStart, onStop, onEdit, onDelete, onAddStream }: LiveStreamTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns: Column[] = [
    { id: 'stream', label: 'Stream Info', minWidth: 300 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'viewers', label: 'Viewers', minWidth: 100 },
    { id: 'duration', label: 'Duration', minWidth: 100 },
    { id: 'quality', label: 'Quality', minWidth: 120 },
    { id: 'server', label: 'Server', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 150 }
  ]

  const filters = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'live', label: 'Live' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'ended', label: 'Ended' }
      ]
    },
    {
      label: 'Quality',
      key: 'quality',
      options: [
        { value: '4K', label: '4K' },
        { value: '1080p', label: '1080p' },
        { value: '720p', label: '720p' }
      ]
    }
  ]

  // Filter streams
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      
return stream[key as keyof typeof stream] === value
    })

    
return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      columns={columns}
      rows={filteredStreams.map(stream => ({
        ...stream,
        stream: <StreamInfoCell stream={stream} />,
        status: <StatusBadge status={stream.status as any} />,
        viewers: <ViewersCell value={stream.viewers} status={stream.status} />,
        quality: <QualityCell quality={stream.quality} bitrate={stream.bitrate} />,
        actions: (
          <StreamActionsCell stream={stream} onStart={onStart} onStop={onStop} onEdit={onEdit} onDelete={onDelete} />
        )
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search streams...'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      actions={
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAddStream}>
          Add Stream
        </Button>
      }
      emptyMessage='No streams found'
    />
  )
}

export default LiveStreamTable
