'use client'

// React Imports
import { useState } from 'react'

import { Box, Button, IconButton } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const PriceCell = ({ value, interval }: { value: number; interval: string }) =>
  value === 0 ? 'Free' : `$${value}/${interval}`

const SubscribersCell = ({ value }: { value: number }) => formatNumber(value)

const ActionsCell = ({
  plan,
  onEdit,
  onView,
  onDelete
}: {
  plan: any
  onEdit: (plan: any) => void
  onView: (plan: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onEdit(plan)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onView(plan)}>
      <i className='ri-eye-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(plan.id)} disabled={plan.activeSubscribers > 0}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface SubscriptionPlansTableProps {
  plans: any[]
  onEdit: (plan: any) => void
  onView: (plan: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const SubscriptionPlansTable = ({ plans, onEdit, onView, onDelete, onAdd }: SubscriptionPlansTableProps) => {
  const [searchValue, setSearchValue] = useState('')

  const columns: Column[] = [
    { id: 'name', label: 'Plan Name', minWidth: 150 },
    { id: 'price', label: 'Price', minWidth: 120 },
    { id: 'activeSubscribers', label: 'Active Subscribers', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'createdDate', label: 'Created', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filteredPlans = plans.filter(plan => plan.name.toLowerCase().includes(searchValue.toLowerCase()))

  return (
    <DataTable
      columns={columns}
      rows={filteredPlans.map(plan => ({
        ...plan,
        price: <PriceCell value={plan.price} interval={plan.interval} />,
        activeSubscribers: <SubscribersCell value={plan.activeSubscribers} />,
        status: <StatusBadge status={plan.status as any} />,
        actions: <ActionsCell plan={plan} onEdit={onEdit} onView={onView} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search plans...'
      actions={
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
          Add Plan
        </Button>
      }
      emptyMessage='No subscription plans found'
    />
  )
}

export default SubscriptionPlansTable
