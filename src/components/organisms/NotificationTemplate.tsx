'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography, Button, IconButton, Chip } from '@mui/material'

// Components Imports
import DataTable, { type Column } from '@components/shared/DataTable'
import StatusBadge from '@components/shared/StatusBadge'

// Custom cell components
const TemplateNameCell = ({ template }: { template: any }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }}>
      {template.name}
    </Typography>
    <Typography variant='caption' color='text.secondary'>
      {template.type.replace('_', ' ')}
    </Typography>
  </Box>
)

const VariablesCell = ({ variables }: { variables: string[] }) => (
  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
    {variables.slice(0, 3).map((variable, index) => (
      <Chip key={index} label={`{{${variable}}}`} size='small' variant='outlined' color='secondary' />
    ))}
    {variables.length > 3 && (
      <Chip label={`+${variables.length - 3}`} size='small' variant='outlined' color='default' />
    )}
  </Box>
)

const PreviewCell = ({ subject, body }: { subject: string; body: string }) => (
  <Box>
    <Typography variant='body2' sx={{ fontWeight: 500 }} noWrap>
      {subject}
    </Typography>
    <Typography variant='caption' color='text.secondary' noWrap>
      {body.substring(0, 50)}...
    </Typography>
  </Box>
)

const TemplateActionsCell = ({
  template,
  onEdit,
  onDelete
}: {
  template: any
  onEdit: (template: any) => void
  onDelete: (id: number) => void
}) => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <IconButton size='small' onClick={() => onEdit(template)}>
      <i className='ri-edit-line' />
    </IconButton>
    <IconButton size='small' color='error' onClick={() => onDelete(template.id)}>
      <i className='ri-delete-bin-line' />
    </IconButton>
  </Box>
)

interface NotificationTemplateProps {
  templates: any[]
  onEdit: (template: any) => void
  onDelete: (id: number) => void
  onAdd: () => void
}

const NotificationTemplate = ({ templates, onEdit, onDelete, onAdd }: NotificationTemplateProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const columns: Column[] = [
    { id: 'template', label: 'Template', minWidth: 200 },
    { id: 'preview', label: 'Preview', minWidth: 300 },
    { id: 'variables', label: 'Variables', minWidth: 200 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 120 }
  ]

  const filters = [
    {
      label: 'Type',
      key: 'type',
      options: [
        { value: 'content_update', label: 'Content Update' },
        { value: 'billing', label: 'Billing' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'system', label: 'System' }
      ]
    },
    {
      label: 'Status',
      key: 'status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' }
      ]
    }
  ]

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchValue.toLowerCase())

    const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
      if (!value) return true
      if (key === 'type') return template.type === value
      if (key === 'status') return template.status === value

      return true
    })

    return matchesSearch && matchesFilters
  })

  return (
    <DataTable
      columns={columns}
      rows={filteredTemplates.map(template => ({
        ...template,
        template: <TemplateNameCell template={template} />,
        preview: <PreviewCell subject={template.subject} body={template.body} />,
        variables: <VariablesCell variables={template.variables} />,
        status: <StatusBadge status={template.status as any} />,
        actions: <TemplateActionsCell template={template} onEdit={onEdit} onDelete={onDelete} />
      }))}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder='Search templates...'
      filters={filters}
      filterValues={filterValues}
      onFilterChange={(key, value) => setFilterValues(prev => ({ ...prev, [key]: value }))}
      actions={
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
          Add Template
        </Button>
      }
      emptyMessage='No templates found'
    />
  )
}

export default NotificationTemplate
