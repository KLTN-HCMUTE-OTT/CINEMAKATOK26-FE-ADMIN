'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, LinearProgress } from '@mui/material'

// Components Imports
import DataTable from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const CampaignNameCell = ({ campaign }: { campaign: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {campaign.name}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {campaign.type.replace('_', ' ')}
    </Typography>
  </Box>
)

const BudgetCell = ({ budget, spent }: { budget: number; spent: number }) => (
  <Box>
    <Typography variant='body2'>
      ${formatNumber(spent)} / ${formatNumber(budget)}
    </Typography>
    <LinearProgress
      variant='determinate'
      value={(spent / budget) * 100}
      sx={{ height: 4, borderRadius: 2, mt: 0.5 }}
      color={spent / budget > 0.9 ? 'error' : spent / budget > 0.7 ? 'warning' : 'primary'}
    />
  </Box>
)

const MetricsCell = ({ campaign }: { campaign: any }) => (
  <Box>
    <Typography variant='body2'>{formatNumber(campaign.impressions)} impressions</Typography>
    <Typography variant='caption' color='text.secondary'>
      {formatNumber(campaign.clicks)} clicks • {formatNumber(campaign.conversions)} conversions
    </Typography>
  </Box>
)

const CampaignActionsCell = ({
  campaign,
  onEdit,
  onDelete
}: {
  campaign: any
  onEdit: (campaign: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onEdit(campaign)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(campaign.id)}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface CampaignsTableProps {
  campaigns: any[]
  onEdit: (campaign: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const CampaignsTable = ({ campaigns, onEdit, onDelete, onAdd }: CampaignsTableProps) => {
  const [searchValue, setSearchValue] = useState('')

  const columns = [
    { id: 'campaign', label: 'Campaign', minWidth: 200 },
    { id: 'budget', label: 'Budget', minWidth: 150 },
    { id: 'metrics', label: 'Performance', minWidth: 200 },
    { id: 'dateRange', label: 'Date Range', minWidth: 180 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  return (
    <DataTable
      rows={filteredCampaigns.map(campaign => ({
        ...campaign,
        campaign: <CampaignNameCell campaign={campaign} />,
        budget: <BudgetCell budget={campaign.budget} spent={campaign.spent} />,
        metrics: <MetricsCell campaign={campaign} />,
        dateRange: `${campaign.startDate} - ${campaign.endDate}`,
        status: <StatusBadge status={campaign.status as any} />,
        actions: <CampaignActionsCell campaign={campaign} onEdit={onEdit} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      emptyMessage='No campaigns found'
    >
      <DataTable.Toolbar>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <DataTable.Search placeholder='Search campaigns...' />
          <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
            Add Campaign
          </Button>
        </div>
      </DataTable.Toolbar>
      {columns.map(column => (
        <DataTable.Column key={column.id} id={column.id} label={column.label} minWidth={column.minWidth} />
      ))}
    </DataTable>
  )
}

export default CampaignsTable
