'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip, LinearProgress } from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const PromotionNameCell = ({ promotion }: { promotion: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {promotion.name}
    </Typography>
    <Chip
      label={promotion.type}
      size='small'
      variant='outlined'
      color={promotion.type === 'discount' ? 'primary' : 'secondary'}
    />
  </Box>
)

const ValueCell = ({ value, valueType }: { value: number; valueType: string }) => (
  <Typography variant='body2' sx={{ fontWeight: 500 }}>
    {valueType === 'percentage' ? `${value}%` : valueType === 'days' ? `${value} days` : `$${value}`}
  </Typography>
)

const UsageCell = ({ usage, maxUsage }: { usage: number; maxUsage: number | null }) => (
  <Box>
    <Typography variant='body2'>
      {formatNumber(usage)} {maxUsage ? `/ ${formatNumber(maxUsage)}` : ''}
    </Typography>
    {maxUsage && (
      <LinearProgress
        variant='determinate'
        value={(usage / maxUsage) * 100}
        sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
      />
    )}
  </Box>
)

const PromotionActionsCell = ({
  promotion,
  onEdit,
  onDelete
}: {
  promotion: any
  onEdit: (promotion: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onEdit(promotion)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(promotion.id)}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface PromotionsTableProps {
  promotions: any[]
  onEdit: (promotion: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const PromotionsTable = ({ promotions, onEdit, onDelete, onAdd }: PromotionsTableProps) => {
  const [searchValue, setSearchValue] = useState('')

  const columns = [
    { id: 'promotion', label: 'Promotion', minWidth: 200 },
    { id: 'value', label: 'Value', minWidth: 120 },
    { id: 'usage', label: 'Usage', minWidth: 150 },
    { id: 'targetAudience', label: 'Target', minWidth: 150 },
    { id: 'dateRange', label: 'Date Range', minWidth: 180 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filteredPromotions = promotions.filter(promotion =>
    promotion.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <DataTable
      rows={filteredPromotions.map(promotion => ({
        ...promotion,
        promotion: <PromotionNameCell promotion={promotion} />,
        value: <ValueCell value={promotion.value} valueType={promotion.valueType} />,
        usage: <UsageCell usage={promotion.usage} maxUsage={promotion.maxUsage} />,
        dateRange: `${promotion.startDate} - ${promotion.endDate}`,
        status: <StatusBadge status={promotion.status as any} />,
        actions: <PromotionActionsCell promotion={promotion} onEdit={onEdit} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      emptyMessage='No promotions found'
    >
      <DataTable.Toolbar>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <DataTable.Search placeholder='Search promotions...' />
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
            Add Promotion
          </Button>
        </div>
      </DataTable.Toolbar>
      {columns.map(column => (
        <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
      ))}
    </DataTable>
  )
}

export default PromotionsTable
