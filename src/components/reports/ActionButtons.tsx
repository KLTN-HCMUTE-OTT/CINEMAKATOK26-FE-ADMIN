import Button from '@mui/material/Button'

interface ActionButtonsProps {
  reportId: string
  onView: (reportId: string) => void
}

const ActionButtons = ({ reportId, onView }: ActionButtonsProps) => {
  return (
    <Button variant='outlined' size='small' onClick={() => onView(reportId)}>
      View
    </Button>
  )
}

export default ActionButtons
