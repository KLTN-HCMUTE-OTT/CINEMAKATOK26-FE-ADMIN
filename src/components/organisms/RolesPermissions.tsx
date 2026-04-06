'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip
} from '@mui/material'

interface Role {
  id: number
  name: string
  users: number
  permissions: string[]
}

interface RolesPermissionsProps {
  initialRoles?: Role[]
  onAddRole?: (role: { name: string; permissions: string[] }) => void
  onEditRole?: (id: number) => void
}

const RolesPermissions = ({ initialRoles, onAddRole, onEditRole }: RolesPermissionsProps) => {
  const [roles] = useState<Role[]>(
    initialRoles || [
      { id: 1, name: 'Admin', users: 3, permissions: ['all'] },
      { id: 2, name: 'Content Manager', users: 5, permissions: ['content.manage', 'content.upload'] },
      { id: 3, name: 'Support', users: 8, permissions: ['users.view', 'support.manage'] },
      { id: 4, name: 'Analyst', users: 2, permissions: ['analytics.view', 'reports.generate'] }
    ]
  )

  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', permissions: [] })

  const handleAddRole = () => {
    onAddRole?.(newRole)
    setRoleModalOpen(false)
    setNewRole({ name: '', permissions: [] })
  }

  const handleEditRole = (id: number) => {
    onEditRole?.(id)
    console.log('Edit role:', id)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h6'>User Roles & Permissions</Typography>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={() => setRoleModalOpen(true)}>
          Add Role
        </Button>
      </Box>

      <List>
        {roles.map(role => (
          <ListItem key={role.id} divider>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {role.name}
                  </Typography>
                  <Chip label={`${role.users} users`} size='small' variant='outlined' />
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  {role.permissions.slice(0, 3).map(permission => (
                    <Chip key={permission} label={permission} size='small' sx={{ mr: 0.5, mb: 0.5 }} variant='tonal' />
                  ))}
                  {role.permissions.length > 3 && (
                    <Chip
                      label={`+${role.permissions.length - 3} more`}
                      size='small'
                      sx={{ mr: 0.5, mb: 0.5 }}
                      variant='outlined'
                    />
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge='end' onClick={() => handleEditRole(role.id)}>
                <i className='ri-edit-line' />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Add Role Modal */}
      <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Role Name'
            value={newRole.name}
            onChange={e => setNewRole(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mt: 2 }}
          />
          <Typography variant='body2' sx={{ mt: 3, mb: 2 }}>
            Permissions (mock - full implementation would include permission selection)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleAddRole} disabled={!newRole.name}>
            Add Role
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RolesPermissions
