'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Box,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material'
import type { Tag } from '@/services'
import { TableSkeleton } from '@/components/ui/Skeleton'

interface TagTableNewProps {
  tags: Tag[]
  totalItems: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onEdit: (tag: Tag) => void
  onDelete: (id: string) => void
  onAdd: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  loading?: boolean
}

const TagTableNew = ({
  tags,
  totalItems,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onAdd,
  searchTerm,
  onSearchChange,
  loading = false
}: TagTableNewProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keep focus on search input after data loads
  useEffect(() => {
    if (searchTerm && searchInputRef.current) {
      // Only refocus if search term exists (user was typing)
      searchInputRef.current.focus()
    }
  }, [tags]) // Refocus when tags update

  return (
    <Card>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            Tags
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            Manage content tags
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={onAdd}>
          Add Tag
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ px: 3, pb: 2 }}>
        <TextField
          fullWidth
          size='small'
          placeholder='Search tags...'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          inputRef={searchInputRef}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line' />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tag Name</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={rowsPerPage} columns={4} />
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                  <Typography variant='body2' color='text.secondary'>
                    No tags found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tags.map(tag => (
                <TableRow key={tag.id} hover>
                  <TableCell>
                    <Chip label={tag.tagName} color='secondary' variant='outlined' size='small' />
                  </TableCell>
                  <TableCell>{new Date(tag.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(tag.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell align='right'>
                    <IconButton size='small' color='primary' onClick={() => onEdit(tag)}>
                      <i className='ri-edit-line' />
                    </IconButton>
                    <IconButton size='small' color='error' onClick={() => onDelete(tag.id)}>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component='div'
        count={totalItems}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Card>
  )
}

export default TagTableNew
