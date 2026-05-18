'use client'

import { useState, useEffect } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'

import { useWatchPartyManagement } from '@/hooks/useWatchPartyManagement'
import WatchPartyStatsCards from '@/components/dashboard/watch-party/WatchPartyStatsCards'
import WatchPartyRoomsTable from '@/components/dashboard/watch-party/WatchPartyRoomsTable'
import RoomDetailDialog from '@/components/dashboard/watch-party/RoomDetailDialog'
import CloseRoomDialog from '@/components/dashboard/watch-party/CloseRoomDialog'
import KickMemberDialog from '@/components/dashboard/watch-party/KickMemberDialog'
import BanUserDialog from '@/components/dashboard/watch-party/BanUserDialog'

const WatchPartyPage = () => {
  const {
    roomsWithHost,
    roomDetail,
    userMap,
    stats,
    loading,
    error,
    pagination,
    fetchRooms,
    fetchRoomDetail,
    refreshStats,
    closeRoom,
    kickMember,
    banUser,
    unbanUser
  } = useWatchPartyManagement()

  const [searchValue, setSearchValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Dialog state
  const [detailOpen, setDetailOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [kickDialogOpen, setKickDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  const [selectedRoom, setSelectedRoom] = useState<API.RoomListItemDto | null>(null)
  const [selectedMember, setSelectedMember] = useState<API.WatchPartyMember | null>(null)
  const [banTargetUserId, setBanTargetUserId] = useState<string | undefined>()
  const [banTargetName, setBanTargetName] = useState<string | undefined>()

  useEffect(() => {
    fetchRooms(1, rowsPerPage)
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setCurrentPage(1)
    if (searchTimeout) clearTimeout(searchTimeout)
    const t = setTimeout(() => fetchRooms(1, rowsPerPage, value), 300)
    setSearchTimeout(t)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchRooms(page, rowsPerPage, searchValue)
  }

  const handleRowsPerPageChange = (rpp: number) => {
    setRowsPerPage(rpp)
    setCurrentPage(1)
    fetchRooms(1, rpp, searchValue)
  }

  const handleViewDetails = async (room: API.RoomListItemDto) => {
    setSelectedRoom(room)
    await fetchRoomDetail(room.roomId)
    setDetailOpen(true)
  }

  const handleForceClose = (room: API.RoomListItemDto) => {
    setSelectedRoom(room)
    setCloseDialogOpen(true)
  }

  const handleKickMember = (member: API.WatchPartyMember) => {
    setSelectedMember(member)
    setKickDialogOpen(true)
  }

  const handleBanUser = (userId: string, displayName?: string) => {
    setBanTargetUserId(userId)
    setBanTargetName(displayName)
    setBanDialogOpen(true)
  }

  const handleCloseRoom = async (roomId: string, reason?: string) => {
    const result = await closeRoom(roomId, reason)
    if (result.success) {
      setDetailOpen(false)
      setCloseDialogOpen(false)
      await refreshStats()
    }
    return result
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 0.5 }}>
            Watch Party Management
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Monitor and moderate active watch party rooms
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<i className='ri-refresh-line' />}
          onClick={async () => {
            await Promise.all([fetchRooms(currentPage, rowsPerPage, searchValue), refreshStats()])
          }}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <WatchPartyStatsCards stats={stats} loading={loading} />

      {/* Rooms Table */}
      <WatchPartyRoomsTable
        rooms={roomsWithHost}
        totalCount={pagination.totalItems}
        loading={loading}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onViewDetails={handleViewDetails}
        onForceClose={handleForceClose}
      />

      {/* Room Detail Dialog */}
      <RoomDetailDialog
        open={detailOpen}
        roomDetail={roomDetail}
        userMap={userMap}
        loading={loading}
        onClose={() => setDetailOpen(false)}
        onKickMember={member => {
          handleKickMember(member)
        }}
        onBanUser={(userId, displayName) => {
          setDetailOpen(false)
          handleBanUser(userId, displayName)
        }}
      />

      {/* Close Room Dialog */}
      <CloseRoomDialog
        open={closeDialogOpen}
        room={selectedRoom}
        onClose={() => setCloseDialogOpen(false)}
        onConfirm={handleCloseRoom}
      />

      {/* Kick Member Dialog */}
      <KickMemberDialog
        open={kickDialogOpen}
        roomId={roomDetail?.roomId ?? selectedRoom?.roomId ?? null}
        member={selectedMember}
        userMap={userMap}
        onClose={() => {
          setKickDialogOpen(false)
          setSelectedMember(null)
        }}
        onKick={kickMember}
        onBan={banUser}
      />

      {/* Ban User Dialog */}
      <BanUserDialog
        open={banDialogOpen}
        userId={banTargetUserId}
        displayName={banTargetName}
        onClose={() => {
          setBanDialogOpen(false)
          setBanTargetUserId(undefined)
          setBanTargetName(undefined)
        }}
        onBan={banUser}
        onUnban={unbanUser}
      />
    </Box>
  )
}

export default WatchPartyPage
