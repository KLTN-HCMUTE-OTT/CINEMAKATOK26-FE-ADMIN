'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const NotificationTitleCell = ({ notification }: { notification: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {notification.title}
    </Typography>
    <Typography variant='caption' color='text.secondary' noWrap>
      {notification.message}
    </Typography>
  </Box>
)

const ChannelsCell = ({ channels }: { channels: string[] }) => (
  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
    {channels.map((channel, index) => (
      <Chip
        key={index}
        label={channel}
        size='small'
        variant='outlined'
        color={
          channel === 'email' ? 'primary' : channel === 'push' ? 'secondary' : channel === 'sms' ? 'warning' : 'default'
        }
      />
    ))}
  </Box>
)

const MetricsCell = ({ notification }: { notification: any }) => (
  <Box>
    <Typography variant='body2'>{formatNumber(notification.sentCount)} sent</Typography>
    {notification.status === 'sent' && (
      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
        <Typography variant='caption' color='text.secondary'>
          Open: {notification.openRate}%
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Click: {notification.clickRate}%
        </Typography>
      </Box>
    )}
  </Box>
)

const NotificationActionsCell = ({
  notification,
  onEdit,
  onDelete
}: {
  notification: any
  onEdit: (notification: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onEdit(notification)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(notification.id)}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface NotificationsListProps {
  notifications: any[]
  onEdit: (notification: any) => void
  onDelete: (id: number) => void
  onSend: () => void
}

const NotificationsList = ({ notifications, onEdit, onDelete, onSend }: NotificationsListProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns = [
    { id: 'notification', label: 'Notification', minWidth: 300 },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'channels', label: 'Channels', minWidth: 150 },
    { id: 'audience', label: 'Target Audience', minWidth: 150 },
    { id: 'metrics', label: 'Metrics', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'scheduledDate', label: 'Scheduled', minWidth: 150 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filters = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'sent', label: 'Sent' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'draft', label: 'Draft' }
      ]
    },
    {
      label: 'Type',
      key: 'type',
      options: [
        { value: 'content_update', label: 'Content Update' },
        { value: 'billing', label: 'Billing' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'system', label: 'System' }
      ]
    }
  ]

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'status') return notification.status === value
      if (key === 'type') return notification.type === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      rows={filteredNotifications.map(notification => ({
        ...notification,
        notification: <NotificationTitleCell notification={notification} />,
        channels: <ChannelsCell channels={notification.channels} />,
        audience: notification.targetAudience,
        metrics: <MetricsCell notification={notification} />,
        status: <StatusBadge status={notification.status as any} />,
        scheduledDate: new Date(notification.scheduledDate).toLocaleString(),
        actions: <NotificationActionsCell notification={notification} onEdit={onEdit} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      emptyMessage='No notifications found'
    >
      <DataTable.Toolbar>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <DataTable.Search placeholder='Search notifications...' />
            <DataTable.Filters />
          </div>
          <Button variant='contained' startIcon={<i className='ri-send-plane-line' />} onClick={onSend}>
            Send Notification
          </Button>
        </div>
      </DataTable.Toolbar>
      {columns.map(column => (
        <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
      ))}
    </DataTable>
  )
}

export default NotificationsList
