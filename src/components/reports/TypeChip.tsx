import Chip from '@mui/material/Chip'

interface TypeChipProps {
  type: string
}

const TypeChip = ({ type }: TypeChipProps) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REVIEW':
        return 'Movie Review'
      case 'EPISODE_REVIEW':
        return 'Episode Review'
      case 'REVIEW_REPLY':
        return 'Review Reply'
      default:
        return type || 'Unknown'
    }
  }

  return <Chip label={getTypeLabel(type)} size='small' color='info' variant='outlined' />
}

export default TypeChip
