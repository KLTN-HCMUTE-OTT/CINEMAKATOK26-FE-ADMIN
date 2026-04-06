'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, LinearProgress } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const VoucherCodeCell = ({ code, discount, type }: { code: string; discount: number; type: string }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
      {code}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {type === 'percentage' ? `${discount}% off` : `$${discount} off`}
    </Typography>
  </Box>
)

const VoucherUsageCell = ({ usage, maxUsage }: { usage: number; maxUsage: number }) => (
  <Box>
    <Typography variant='body2'>
      {formatNumber(usage)} / {formatNumber(maxUsage)}
    </Typography>
    <LinearProgress 
      variant='determinate' 
      value={(usage / maxUsage) * 100} 
      sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
      color={usage / maxUsage > 0.8 ? 'warning' : 'primary'}
    />
  </Box>
)

const VoucherActionsCell = ({
  voucher,
  onEdit,
  onDelete
}: {
  voucher: any
  onEdit: (voucher: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onEdit(voucher)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(voucher.id)}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface VouchersTableProps {
  vouchers: any[]
  onEdit: (voucher: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const VouchersTable = ({ vouchers, onEdit, onDelete, onAdd }: VouchersTableProps) => {
  const [searchValue, setSearchValue] = useState('')

  const columns: Column[] = [
    { id: 'voucher', label: 'Voucher Code', minWidth: 180 },
    { id: 'usage', label: 'Usage', minWidth: 150 },
    { id: 'expiryDate', label: 'Expires', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filteredVouchers = vouchers.filter(voucher =>
    voucher.code.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <DataTable
      columns={columns}
      rows={filteredVouchers.map(voucher => ({
        ...voucher,
        voucher: <VoucherCodeCell code={voucher.code} discount={voucher.discount} type={voucher.type} />,
        usage: <VoucherUsageCell usage={voucher.usage} maxUsage={voucher.maxUsage} />,
        status: <StatusBadge status={voucher.status as any} />,
        actions: (
          <VoucherActionsCell
            voucher={voucher}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search vouchers...'
      actions={
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
          Add Voucher
        </Button>
      }
      emptyMessage='No vouchers found'
    />
  )
}

export default VouchersTable
