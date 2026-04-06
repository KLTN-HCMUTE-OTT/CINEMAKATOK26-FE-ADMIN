import Chip from '@mui/material/Chip'

interface StatusChipProps {
  status: string
}

const StatusChip = ({ status }: StatusChipProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'banned':
        return 'error'
      case 'resolved':
        return 'info'
      default:
        return 'default'
    }
  }

  return <Chip label={status} color={getStatusColor(status)} size='small' variant='outlined' />
}

export default StatusChip
