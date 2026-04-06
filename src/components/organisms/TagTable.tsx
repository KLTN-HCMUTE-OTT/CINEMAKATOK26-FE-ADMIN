'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

// Custom cell components
const TagNameCell = ({ tag }: { tag: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Chip
      label={tag.name}
      size='small'
      sx={{
        bgcolor: tag.color || '#1976d2',
        color: '#fff',
        fontWeight: 500
      }}
    />
    <Typography variant='caption' color='text.secondary'>
      /{tag.slug}
    </Typography>
  </Box>
)

const ContentCountCell = ({ count }: { count: number }) => (
  <Typography variant='body2'>{formatNumber(count)} titles</Typography>
)

const TagActionsCell = ({
  tag,
  onEdit,
  onView,
  onDelete
}: {
  tag: any
  onEdit: (tag: any) => void
  onView: (tag: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onView(tag)}>
      <i className='ri-eye-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onEdit(tag)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(tag.id)} disabled={tag.contentCount > 0}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface TagTableProps {
  tags: any[]
  onEdit: (tag: any) => void
  onView: (tag: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const TagTable = ({ tags, onEdit, onView, onDelete, onAdd }: TagTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns: Column[] = [
    { id: 'tag', label: 'Tag', minWidth: 200 },
    { id: 'description', label: 'Description', minWidth: 250 },
    { id: 'content', label: 'Content', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'createdDate', label: 'Created', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filters = [
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' }
      ]
    }
  ]

  // Filter tags
  const filteredTags = tags.filter(tag => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'status') return tag.status === value
      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      columns={columns}
      rows={filteredTags.map(tag => ({
        ...tag,
        tag: <TagNameCell tag={tag} />,
        content: <ContentCountCell count={tag.contentCount} />,
        status: <StatusBadge status={tag.status as any} />,
        actions: <TagActionsCell tag={tag} onEdit={onEdit} onView={onView} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search tags...'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      actions={
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
          Add Tag
        </Button>
      }
      emptyMessage='No tags found'
    />
  )
}

export default TagTable
