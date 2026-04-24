'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'
import UserEditDialog from '@/components/dashboard/users/UserEditDialog'
import UserBanDialog from '@/components/dashboard/users/UserBanDialog'

// Hooks Imports
import { useUserManagement } from '@/hooks/useUserManagement'

const subscriptionOptions = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' }
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

// Custom cell components
const UserCell = ({ user }: { user: any }) => {
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
        {!user.avatar && getInitials(user.name)}
      </Avatar>
      <Box>
        <Typography variant='body2' sx={{ fontWeight: 500 }}>
          {user.name}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {user.email}
        </Typography>
      </Box>
    </Box>
  )
}

const StatusCell = ({ status, isBanned }: { status: string; isBanned: boolean }) => (
  <Chip
    label={isBanned ? 'BANNED' : status}
    size='small'
    color={isBanned ? 'error' : status === 'ACTIVATED' ? 'success' : status === 'DEACTIVATED' ? 'warning' : 'default'}
    variant='tonal'
  />
)

const RoleCell = ({ isAdmin }: { isAdmin: boolean }) => (
  <Chip
    label={isAdmin ? 'Admin' : 'User'}
    size='small'
    color={isAdmin ? 'primary' : 'default'}
    variant={isAdmin ? 'tonal' : 'outlined'}
  />
)

const UserActionsCell = ({
  user,
  onView,
  onEdit,
  onBan
}: {
  user: any
  onView: (user: any) => void
  onEdit: (userId: string) => void
  onBan: (userId: string) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' title='View details' onClick={() => onView(user)}>
      <i className='ri-eye-line' />
    </IconButton>
    <IconButton size='small' title='Edit user' onClick={() => onEdit(user.id)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton
      size='small'
      title={user.isBanned ? 'Unban user' : 'Ban user'}
      color={user.isBanned ? 'success' : 'error'}
      onClick={() => onBan(user.id)}
    >
      <i className={`ri-${user.isBanned ? 'checkbox-circle' : 'forbid'}-line`} />
    </IconButton>
  </Box>
)

const UsersPage = () => {
  const {
    users,
    userDetail,
    loading,
    error,
    pagination,
    fetchUsers,
    fetchUserDetail,
    updateUserInfo,
    banUser,
    unbanUser
  } = useUserManagement()
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetailOpen, setUserDetailOpen] = useState(false)
  const [userEditOpen, setUserEditOpen] = useState(false)
  const [userBanOpen, setUserBanOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Initial load
  useEffect(() => {
    fetchUsers(1, rowsPerPage)
  }, [])

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setCurrentPage(1)

    if (searchTimeout) clearTimeout(searchTimeout)

    const timeout = setTimeout(() => {
      fetchUsers(1, rowsPerPage, value)
    }, 300)

    setSearchTimeout(timeout)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    fetchUsers(newPage, rowsPerPage, searchValue)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
    fetchUsers(1, newRowsPerPage, searchValue)
  }

  const columns = [
    { id: 'user', label: 'User', minWidth: 250 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'email', label: 'Email', minWidth: 150 },
    { id: 'role', label: 'Role', minWidth: 100 },
    { id: 'createdAt', label: 'Join Date', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const handleViewUser = async (user: any) => {
    setSelectedUser(user)
    await fetchUserDetail(user.id)
    setUserDetailOpen(true)
    setTabValue(0)
  }

  const handleEditUser = async (userId: string) => {
    await fetchUserDetail(userId)
    setUserEditOpen(true)
  }

  const handleBanUser = async (userId: string) => {
    await fetchUserDetail(userId)
    setUserBanOpen(true)
  }

  const handleSubmitEdit = async (data: any) => {
    if (!userDetail) return { success: false }
    return await updateUserInfo(userDetail.id, data)
  }

  const handleSubmitBan = async (reason: string, durationDays: number) => {
    if (!userDetail) return { success: false }
    return await banUser(userDetail.id, reason, durationDays)
  }

  const handleSubmitUnban = async () => {
    if (!userDetail) return { success: false }
    return await unbanUser(userDetail.id)
  }

  // Format date
  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          User Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage platform users, update information, and control access
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        rows={users.map(user => ({
          ...user,
          user: <UserCell user={user} />,
          status: <StatusCell status={user.status} isBanned={user.isBanned} />,
          role: <RoleCell isAdmin={user.isAdmin} />,
          createdAt: formatDate(user.createdAt),
          actions: <UserActionsCell user={user} onView={handleViewUser} onEdit={handleEditUser} onBan={handleBanUser} />
        }))}
        totalCount={pagination.totalItems}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        loading={loading}
        emptyMessage='No users found'
      >
        <DataTable.Toolbar>
          <DataTable.Search placeholder='Search users by name or email...' />
        </DataTable.Toolbar>
        {columns.map(column => (
          <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
        ))}
        <DataTable.Pagination
          totalCount={pagination.totalItems}
          page={currentPage - 1}
          rowsPerPage={rowsPerPage}
          onPageChange={newPage => handlePageChange(newPage + 1)}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </DataTable>

      {/* User Detail Modal */}
      <Dialog open={userDetailOpen} onClose={() => setUserDetailOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={userDetail?.avatar} alt={userDetail?.name} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography variant='h6'>{userDetail?.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {userDetail?.email}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} aria-label='user detail tabs'>
              <Tab label='Profile' />
              <Tab label='Status' />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Name:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {userDetail?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Email:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {userDetail?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Phone:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {userDetail?.phoneNumber || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Address:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {userDetail?.address || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Date of Birth:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {userDetail?.dateOfBirth ? formatDate(userDetail.dateOfBirth) : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Gender:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {userDetail?.gender || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Role:
                  </Typography>
                  <Chip
                    label={userDetail?.isAdmin ? 'Admin' : 'User'}
                    size='small'
                    color={userDetail?.isAdmin ? 'primary' : 'default'}
                    variant={userDetail?.isAdmin ? 'tonal' : 'outlined'}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Email Verified:
                  </Typography>
                  <Chip
                    label={userDetail?.isEmailVerified ? 'Yes' : 'No'}
                    size='small'
                    color={userDetail?.isEmailVerified ? 'success' : 'warning'}
                    variant='tonal'
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Join Date:
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {formatDate(userDetail?.createdAt)}
                  </Typography>
                </Box>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Ban Status:
                  </Typography>
                  <Chip
                    label={userDetail?.isBanned ? 'BANNED' : 'ACTIVE'}
                    color={userDetail?.isBanned ? 'error' : 'success'}
                    variant='tonal'
                  />
                </Box>
                {userDetail?.isBanned && userDetail?.banReason && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Ban Reason:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500, textAlign: 'right', maxWidth: '50%' }}>
                      {userDetail.banReason}
                    </Typography>
                  </Box>
                )}
                {userDetail?.isBanned && userDetail?.bannedUntil && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='body2' color='text.secondary'>
                      Banned Until:
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {formatDate(userDetail.bannedUntil)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setUserDetailOpen(false)}>Close</Button>
          <Button
            variant='outlined'
            onClick={() => {
              setUserDetailOpen(false)
              handleEditUser(userDetail?.id || '')
            }}
          >
            Edit User
          </Button>
          <Button
            variant='outlined'
            color={userDetail?.isBanned ? 'success' : 'error'}
            onClick={() => {
              setUserDetailOpen(false)
              handleBanUser(userDetail?.id || '')
            }}
          >
            {userDetail?.isBanned ? 'Unban User' : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Edit Dialog */}
      <UserEditDialog
        open={userEditOpen}
        user={userDetail}
        loading={loading}
        onClose={() => setUserEditOpen(false)}
        onSubmit={handleSubmitEdit}
      />

      {/* User Ban Dialog */}
      <UserBanDialog
        open={userBanOpen}
        user={userDetail}
        loading={loading}
        onClose={() => setUserBanOpen(false)}
        onBan={handleSubmitBan}
        onUnban={handleSubmitUnban}
      />
    </Box>
  )
}

export default UsersPage
