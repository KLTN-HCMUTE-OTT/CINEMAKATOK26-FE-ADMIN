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
const CategoryNameCell = ({ category }: { category: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {category.parentId ? '└─ ' : ''}
      {category.name}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      /{category.slug}
    </Typography>
  </Box>
)

const ContentCountCell = ({ count, featured }: { count: number; featured: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Typography variant='body2'>{formatNumber(count)} titles</Typography>
    {featured && <Chip label='Featured' size='small' color='primary' variant='outlined' />}
  </Box>
)

const CategoryActionsCell = ({
  category,
  onEdit,
  onView,
  onDelete
}: {
  category: any
  onEdit: (category: any) => void
  onView: (category: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onView(category)}>
      <i className='ri-eye-line' />
    </IconButton>
    <IconButton size='small' onClick={() => onEdit(category)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(category.id)} disabled={category.contentCount > 0}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface CategoryTableProps {
  categories: any[]
  onEdit: (category: any) => void
  onView: (category: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const CategoryTable = ({ categories, onEdit, onView, onDelete, onAdd }: CategoryTableProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns: Column[] = [
    { id: 'category', label: 'Category', minWidth: 200 },
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
    },
    {
      label: 'Type',
      key: 'type',
      options: [
        { value: 'parent', label: 'Main Categories' },
        { value: 'child', label: 'Subcategories' }
      ]
    }
  ]

  // Create hierarchical structure
  const hierarchicalCategories = categories
    .filter(cat => !cat.parentId)
    .map(parent => [parent, ...categories.filter(cat => cat.parentId === parent.id)])
    .flat()

  // Filter categories
  const filteredCategories = hierarchicalCategories.filter(category => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      category.description.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true

      if (key === 'status') return category.status === value

      if (key === 'type') {
        return value === 'parent' ? !category.parentId : !!category.parentId
      }

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      columns={columns}
      rows={filteredCategories.map(category => ({
        ...category,
        category: <CategoryNameCell category={category} />,
        content: <ContentCountCell count={category.contentCount} featured={category.featured} />,
        status: <StatusBadge status={category.status as any} />,
        actions: <CategoryActionsCell category={category} onEdit={onEdit} onView={onView} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search categories...'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      actions={
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
          Add Category
        </Button>
      }
      emptyMessage='No categories found'
    />
  )
}

export default CategoryTable
