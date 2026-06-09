'use client'

import React, { createContext, useContext } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'

export interface Column {
  id: string
  label: string
  minWidth?: number
  align?: 'right' | 'left' | 'center'
  format?: (value: any, row?: any) => string | React.ReactNode
}

interface Filter {
  label: string
  key: string
  options: { value: string; label: string }[]
}

interface DataTableProps {
  columns?: Column[]
  rows: any[]
  totalCount?: number
  page?: number
  rowsPerPage?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  searchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: Filter[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  actions?: React.ReactNode
  loading?: boolean
  emptyMessage?: string
  children?: React.ReactNode
}

interface ToolbarProps {
  children: React.ReactNode
}

interface SearchProps {
  placeholder?: string
}

interface ColumnProps extends Column {
  render?: (row: any) => React.ReactNode
}

interface DataTableContextValue {
  searchValue: string
  onSearchChange?: (value: string) => void
  searchPlaceholder: string
  filters: Filter[]
  filterValues: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
}

const DataTableContext = createContext<DataTableContextValue | null>(null)

const useDataTableContext = () => {
  const context = useContext(DataTableContext)

  if (!context) {
    throw new Error('DataTable compound subcomponents must be used inside DataTable')
  }

  return context
}

function renderRows(columns: Column[], rows: any[], loading: boolean, emptyMessage: string) {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align='center' sx={{ py: 4 }}>
          <Typography variant='body2' color='text.secondary'>
            Loading...
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align='center' sx={{ py: 4 }}>
          <Typography variant='body2' color='text.secondary'>
            {emptyMessage}
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  return rows.map((row, index) => (
    <TableRow hover role='checkbox' tabIndex={-1} key={index}>
      {columns.map(column => {
        const value = row[column.id]

        return (
          <TableCell key={column.id} align={column.align}>
            {column.format ? column.format(value, row) : value}
          </TableCell>
        )
      })}
    </TableRow>
  ))
}

function DataTableRoot({
  columns,
  rows,
  totalCount = rows.length,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  searchable = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  filterValues = {},
  onFilterChange,
  actions,
  loading = false,
  emptyMessage = 'No data available',
  children
}: DataTableProps) {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10))
    onPageChange?.(0)
  }

  const isCompoundMode = Boolean(children)

  const compoundColumns: Column[] = []
  const compoundToolbar: React.ReactNode[] = []
  const compoundPagination: React.ReactNode[] = []

  if (isCompoundMode) {
    React.Children.forEach(children, child => {
      if (!React.isValidElement(child)) return

      if (child.type === DataTableColumn) {
        const columnProps = child.props as ColumnProps

        compoundColumns.push({
          id: columnProps.id,
          label: columnProps.label,
          minWidth: columnProps.minWidth,
          align: columnProps.align,
          format: columnProps.render ? (_value: any, row?: any) => columnProps.render?.(row) : columnProps.format
        })
      } else if (child.type === DataTableToolbar) {
        compoundToolbar.push(child)
      } else if (child.type === DataTablePaginationSlot) {
        compoundPagination.push(child)
      }
    })
  }

  const activeColumns = isCompoundMode ? compoundColumns : columns || []

  return (
    <DataTableContext.Provider
      value={{
        searchValue,
        onSearchChange,
        searchPlaceholder,
        filters,
        filterValues,
        onFilterChange
      }}
    >
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isCompoundMode
          ? compoundToolbar
          : (searchable || filters.length > 0 || actions) && (
              <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                    {searchable && (
                      <TextField
                        size='small'
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={e => onSearchChange?.(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <i className='ri-search-line' />
                            </InputAdornment>
                          )
                        }}
                        sx={{ minWidth: 200 }}
                      />
                    )}

                    {filters.map(filter => (
                      <FormControl key={filter.key} size='small' sx={{ minWidth: 120 }}>
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                          value={filterValues[filter.key] || ''}
                          label={filter.label}
                          onChange={e => onFilterChange?.(filter.key, e.target.value)}
                        >
                          <MenuItem value=''>
                            <em>All</em>
                          </MenuItem>
                          {filter.options.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ))}
                  </Box>

                  {actions && <Box>{actions}</Box>}
                </Box>
              </Box>
            )}

        <TableContainer>
          <Table stickyHeader aria-label='data table'>
            <TableHead>
              <TableRow>
                {activeColumns.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ fontWeight: 600 }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderRows(activeColumns, rows, loading, emptyMessage)}</TableBody>
          </Table>
        </TableContainer>

        {isCompoundMode ? (
          compoundPagination.length > 0 ? (
            compoundPagination
          ) : null
        ) : (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component='div'
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </DataTableContext.Provider>
  )
}

function DataTableToolbar({ children }: ToolbarProps) {
  return <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>{children}</Box>
}

function DataTableSearch({ placeholder }: SearchProps) {
  const { searchValue, onSearchChange, searchPlaceholder } = useDataTableContext()

  return (
    <TextField
      size='small'
      placeholder={placeholder || searchPlaceholder}
      value={searchValue}
      onChange={e => onSearchChange?.(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <i className='ri-search-line' />
          </InputAdornment>
        )
      }}
      sx={{ minWidth: 200 }}
    />
  )
}

function DataTableFilters() {
  const { filters, filterValues, onFilterChange } = useDataTableContext()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {filters.map(filter => (
        <FormControl key={filter.key} size='small' sx={{ minWidth: 120 }}>
          <InputLabel>{filter.label}</InputLabel>
          <Select
            value={filterValues[filter.key] || ''}
            label={filter.label}
            onChange={e => onFilterChange?.(filter.key, e.target.value)}
          >
            <MenuItem value=''>
              <em>All</em>
            </MenuItem>
            {filter.options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Box>
  )
}

function DataTableColumn(_props: ColumnProps) {
  return null
}

function DataTablePaginationSlot({
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}: {
  totalCount: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}) {
  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25, 50]}
      component='div'
      count={totalCount}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(_event, newPage) => onPageChange(newPage)}
      onRowsPerPageChange={event => onRowsPerPageChange(parseInt(event.target.value, 10))}
    />
  )
}

const DataTable = Object.assign(DataTableRoot, {
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  Filters: DataTableFilters,
  Column: DataTableColumn,
  Pagination: DataTablePaginationSlot
})

export default DataTable
