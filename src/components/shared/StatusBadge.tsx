'use client'

// MUI Imports
import Chip from '@mui/material/Chip'

// Types
type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'uploading'
  | 'transcoding'
  | 'ready'
  | 'error'
  | 'published'
  | 'draft'
  | 'cancelled'

interface StatusBadgeProps {
  status: StatusType
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined' | 'tonal'
}

const getStatusConfig = (status: StatusType) => {
  const configs = {
    active: { color: 'success' as const, label: 'Active' },
    inactive: { color: 'default' as const, label: 'Inactive' },
    pending: { color: 'warning' as const, label: 'Pending' },
    uploading: { color: 'info' as const, label: 'Uploading' },
    transcoding: { color: 'secondary' as const, label: 'Transcoding' },
    ready: { color: 'success' as const, label: 'Ready' },
    error: { color: 'error' as const, label: 'Error' },
    published: { color: 'success' as const, label: 'Published' },
    draft: { color: 'warning' as const, label: 'Draft' },
    cancelled: { color: 'error' as const, label: 'Cancelled' }
  }

  return configs[status] || { color: 'default' as const, label: status }
}

const StatusBadge = ({ status, size = 'small', variant = 'tonal' }: StatusBadgeProps) => {
  const config = getStatusConfig(status)

  return <Chip label={config.label} color={config.color} size={size} variant={variant} />
}

export default StatusBadge
