import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

interface ActionConfirmationDialogProps {
  open: boolean
  action: 'approve' | 'reject' | 'ban' | 'delete' | null
  onClose: () => void
  onConfirm: () => void
}

const ActionConfirmationDialog = ({ open, action, onClose, onConfirm }: ActionConfirmationDialogProps) => {
  const getActionTitle = () => {
    switch (action) {
      case 'approve':
        return 'Approve Report'
      case 'reject':
        return 'Reject Report'
      case 'ban':
        return 'Ban Content'
      case 'delete':
        return 'Delete Report'
      default:
        return 'Confirm Action'
    }
  }

  const getActionMessage = () => {
    switch (action) {
      case 'approve':
        return 'Are you sure you want to approve this report? The reported content will be flagged.'
      case 'reject':
        return 'Are you sure you want to reject this report? The content will remain active.'
      case 'ban':
        return 'Are you sure you want to ban this content? This action may affect user experience.'
      case 'delete':
        return 'Are you sure you want to delete this report? This action cannot be undone.'
      default:
        return 'Are you sure you want to proceed with this action?'
    }
  }

  const getActionColor = (): 'primary' | 'error' | 'success' | 'warning' => {
    switch (action) {
      case 'approve':
        return 'success'
      case 'reject':
        return 'warning'
      case 'ban':
      case 'delete':
        return 'error'
      default:
        return 'primary'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>{getActionTitle()}</DialogTitle>
      <DialogContent>
        <Alert severity={action === 'ban' || action === 'delete' ? 'error' : 'warning'} sx={{ mb: 2 }}>
          {getActionMessage()}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant='contained' color={getActionColor()}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActionConfirmationDialog
