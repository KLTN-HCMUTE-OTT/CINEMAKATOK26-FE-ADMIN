import type { Meta, StoryObj } from '@storybook/react'

import DataTable from './DataTable'
import type { Column } from './DataTable'

const sampleColumns: Column[] = [
  { id: 'id', label: 'ID', minWidth: 60 },
  { id: 'name', label: 'Name', minWidth: 160 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 100 }
]

const sampleRows = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Inactive'
}))

const meta: Meta<typeof DataTable> = {
  title: 'Shared/DataTable',
  component: DataTable,
  args: {
    columns: sampleColumns,
    rows: sampleRows.slice(0, 10),
    totalCount: 25,
    page: 0,
    rowsPerPage: 10
  }
}

export default meta

type Story = StoryObj<typeof DataTable>

export const Default: Story = {}

export const WithSearch: Story = {
  args: {
    searchable: true,
    searchPlaceholder: 'Search users...'
  }
}

export const WithFilters: Story = {
  args: {
    searchable: true,
    filters: [
      {
        label: 'Status',
        key: 'status',
        options: [
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'inactive', label: 'Inactive' }
        ]
      }
    ],
    filterValues: { status: '' }
  }
}

export const Loading: Story = {
  args: { loading: true }
}

export const Empty: Story = {
  args: {
    rows: [],
    totalCount: 0,
    emptyMessage: 'No users found'
  }
}
