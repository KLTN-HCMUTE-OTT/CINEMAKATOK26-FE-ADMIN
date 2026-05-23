'use client'

import { Avatar, Box, Chip, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import DataTable from '@/components/shared/DataTable'

interface RoomWithHost extends API.RoomListItemDto {
  hostDisplayName: string
  hostAvatarUrl?: string
}

interface WatchPartyRoomsTableProps {
  rooms: RoomWithHost[]
  totalCount: number
  loading: boolean
  currentPage: number
  rowsPerPage: number
  searchValue: string
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onViewDetails: (room: RoomWithHost) => void
  onForceClose: (room: RoomWithHost) => void
  onWatchLive?: (room: RoomWithHost) => void
}

const formatRelativeTime = (epochMs: number) => {
  const diff = Date.now() - epochMs
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const RoomActionsCell = ({
  room,
  onViewDetails,
  onForceClose,
  onWatchLive
}: {
  room: RoomWithHost
  onViewDetails: (room: RoomWithHost) => void
  onForceClose: (room: RoomWithHost) => void
  onWatchLive?: (room: RoomWithHost) => void
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <i className='ri-more-2-line' />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {onWatchLive && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null)
              onWatchLive(room)
            }}
          >
            <i className='ri-live-line' style={{ marginRight: 8 }} />
            Watch Live
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            onForceClose(room)
          }}
          sx={{ color: 'error.main' }}
        >
          <i className='ri-close-circle-line' style={{ marginRight: 8 }} />
          Force Close
        </MenuItem>
      </Menu>
    </>
  )
}

const WatchPartyRoomsTable = ({
  rooms,
  totalCount,
  loading,
  currentPage,
  rowsPerPage,
  searchValue,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onForceClose,
  onWatchLive
}: WatchPartyRoomsTableProps) => {
  const columns = [
    { id: 'title', label: 'Title', minWidth: 220 },
    { id: 'host', label: 'Host', minWidth: 180 },
    { id: 'videoId', label: 'Video ID', minWidth: 130 },
    { id: 'members', label: 'Members', minWidth: 100 },
    { id: 'created', label: 'Created', minWidth: 110 },
    { id: 'actions', label: 'Actions', minWidth: 80 }
  ]

  const rows = rooms.map(room => ({
    ...room,
    title: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          {room.title}
        </Typography>
        <Chip
          label={room.isPublic ? 'Public' : 'Private'}
          size='small'
          color={room.isPublic ? 'success' : 'default'}
          variant='tonal'
          sx={{ fontSize: '0.65rem', height: 18 }}
        />
      </Box>
    ),
    host: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={room.hostAvatarUrl} alt={room.hostDisplayName} sx={{ width: 28, height: 28 }}>
          {room.hostDisplayName[0]?.toUpperCase()}
        </Avatar>
        <Typography variant='body2'>{room.hostDisplayName}</Typography>
      </Box>
    ),
    videoId: (
      <Tooltip title={room.videoId}>
        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
          {room.videoId.length > 12 ? `${room.videoId.slice(0, 12)}…` : room.videoId}
        </Typography>
      </Tooltip>
    ),
    members: (
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {room.memberCount}/{room.maxMembers}
      </Typography>
    ),
    created: (
      <Typography variant='body2' color='text.secondary'>
        {formatRelativeTime(room.createdAt)}
      </Typography>
    ),
    actions: (
      <RoomActionsCell
        room={room}
        onViewDetails={onViewDetails}
        onForceClose={onForceClose}
        onWatchLive={onWatchLive}
      />
    )
  }))

  return (
    <DataTable
      rows={rows}
      totalCount={totalCount}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      loading={loading}
      emptyMessage='No active watch party rooms'
    >
      <DataTable.Toolbar>
        <DataTable.Search placeholder='Search by title or host...' />
      </DataTable.Toolbar>
      {columns.map(column => (
        <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
      ))}
      <DataTable.Pagination
        totalCount={totalCount}
        page={currentPage - 1}
        rowsPerPage={rowsPerPage}
        onPageChange={newPage => onPageChange(newPage + 1)}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </DataTable>
  )
}

export default WatchPartyRoomsTable
