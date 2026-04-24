import { Button } from '@mui/material'

interface AddSeasonButtonProps {
  onAddSeason: () => void
}

const AddSeasonButton = ({ onAddSeason }: AddSeasonButtonProps) => {
  return (
    <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAddSeason} fullWidth size='large'>
      Add New Season
    </Button>
  )
}

export default AddSeasonButton
