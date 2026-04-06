'use client'

// React Imports
import React from 'react'

// MUI Imports
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

// Types
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
  columns: Column[]
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
}

const DataTable = ({
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
  emptyMessage = 'No data available'
}: DataTableProps) => {
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange?.(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10))
    onPageChange?.(0)
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header with Search and Filters */}
      {(searchable || filters.length > 0 || actions) && (
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}
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

      {/* Table */}
      <TableContainer>
        <Table stickyHeader aria-label='data table'>
          <TableHead>
            <TableRow>
              {columns.map(column => (
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
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center' sx={{ py: 4 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center' sx={{ py: 4 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                  {columns.map(column => {
                    const value = row[column.id]

                    
return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component='div'
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default DataTable
