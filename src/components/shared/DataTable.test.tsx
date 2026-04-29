import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import DataTable from './DataTable'

const mockColumns = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 100 }
]

const mockRows = [
  { name: 'Alice', email: 'alice@test.com', status: 'active' },
  { name: 'Bob', email: 'bob@test.com', status: 'inactive' },
  { name: 'Charlie', email: 'charlie@test.com', status: 'pending' }
]

describe('DataTable', () => {
  describe('rendering', () => {
    it('renders column headers', () => {
      render(<DataTable columns={mockColumns} rows={mockRows} />)

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('renders row data', () => {
      render(<DataTable columns={mockColumns} rows={mockRows} />)

      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('alice@test.com')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })

    it('renders empty message when no rows', () => {
      render(<DataTable columns={mockColumns} rows={[]} emptyMessage="No users found" />)

      expect(screen.getByText('No users found')).toBeInTheDocument()
    })

    it('renders default empty message', () => {
      render(<DataTable columns={mockColumns} rows={[]} />)

      expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('renders loading state', () => {
      render(<DataTable columns={mockColumns} rows={[]} loading={true} />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('renders search input when searchable', () => {
      render(<DataTable columns={mockColumns} rows={mockRows} searchable={true} />)

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('does not render search when searchable is false', () => {
      render(<DataTable columns={mockColumns} rows={mockRows} searchable={false} />)

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('calls onSearchChange when typing in search', () => {
      const onSearchChange = vi.fn()
      render(
        <DataTable
          columns={mockColumns}
          rows={mockRows}
          searchable={true}
          searchValue=""
          onSearchChange={onSearchChange}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search...')
      fireEvent.change(searchInput, { target: { value: 'Alice' } })

      expect(onSearchChange).toHaveBeenCalledWith('Alice')
    })

    it('uses custom search placeholder', () => {
      render(
        <DataTable
          columns={mockColumns}
          rows={mockRows}
          searchable={true}
          searchPlaceholder="Find users..."
        />
      )

      expect(screen.getByPlaceholderText('Find users...')).toBeInTheDocument()
    })
  })

  describe('pagination', () => {
    it('renders pagination controls', () => {
      render(
        <DataTable
          columns={mockColumns}
          rows={mockRows}
          totalCount={50}
          page={0}
          rowsPerPage={10}
        />
      )

      expect(screen.getByText(/of 50/)).toBeInTheDocument()
      expect(screen.getByText(/Rows per page/)).toBeInTheDocument()
    })

    it('calls onPageChange when navigating', () => {
      const onPageChange = vi.fn()
      render(
        <DataTable
          columns={mockColumns}
          rows={mockRows}
          totalCount={50}
          page={0}
          rowsPerPage={10}
          onPageChange={onPageChange}
        />
      )

      const nextButton = screen.getByLabelText('Go to next page')
      fireEvent.click(nextButton)

      expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('calls onRowsPerPageChange', () => {
      const onRowsPerPageChange = vi.fn()
      const onPageChange = vi.fn()
      render(
        <DataTable
          columns={mockColumns}
          rows={mockRows}
          totalCount={50}
          page={0}
          rowsPerPage={10}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )

      const rowsSelect = screen.getByRole('combobox')
      fireEvent.mouseDown(rowsSelect)

      const option25 = screen.getByRole('option', { name: '25' })
      fireEvent.click(option25)

      expect(onRowsPerPageChange).toHaveBeenCalledWith(25)
    })
  })

  describe('column format', () => {
    it('uses column format function when provided', () => {
      const columns = [
        {
          id: 'amount',
          label: 'Amount',
          format: (value: number) => `$${value.toFixed(2)}`
        }
      ]
      const rows = [{ amount: 100 }]

      render(<DataTable columns={columns} rows={rows} searchable={false} />)

      expect(screen.getByText('$100.00')).toBeInTheDocument()
    })
  })

  describe('compound component mode', () => {
    it('renders with compound Column components', () => {
      render(
        <DataTable rows={mockRows}>
          <DataTable.Column id="name" label="Full Name" />
          <DataTable.Column id="email" label="Email Address" />
        </DataTable>
      )

      expect(screen.getByText('Full Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    it('renders with Toolbar and Search compound components', () => {
      render(
        <DataTable rows={mockRows} searchValue="" onSearchChange={() => {}}>
          <DataTable.Toolbar>
            <DataTable.Search placeholder="Find..." />
          </DataTable.Toolbar>
          <DataTable.Column id="name" label="Name" />
        </DataTable>
      )

      expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument()
    })
  })
})
