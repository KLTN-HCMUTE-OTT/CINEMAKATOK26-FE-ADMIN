'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'



// Components Imports
import TagTableNew from '@/components/content/TagTableNew'
import TagModalNew from '@/components/content/TagModalNew'

// API Imports
import { tagApi, type Tag, type CreateTagDto, type UpdateTagDto } from '@/services'

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Search
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)

  // Auto-hide alerts after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000)

      
return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 2000)

      
return () => clearTimeout(timer)
    }
  }, [success])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay - faster for real-time feel

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await tagApi.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearchTerm || undefined
      })

      console.log('Tags API Response:', response.data)

      // Check if response and response.data exist and is an array
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.error('Invalid response structure:', response)
        setTags([])
        setTotalItems(0)
        
return
      }

      setTags(response.data)
      setTotalItems(response.meta.totalItems || response.data.length)
    } catch (err: any) {
      setError(err.message || 'Failed to load tags')
      console.error('Error fetching tags:', err)
      setTags([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, debouncedSearchTerm])

  // Handlers
  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(0)
  }

  const handleOpenAddModal = () => {
    setModalMode('create')
    setSelectedTag(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (tag: Tag) => {
    setModalMode('edit')
    setSelectedTag(tag)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedTag(null)
  }

  const handleSaveTag = async (data: CreateTagDto | UpdateTagDto) => {
    try {
      setError(null)

      if (modalMode === 'create') {
        await tagApi.create(data as CreateTagDto)
        setSuccess('Tag created successfully')
      } else if (selectedTag) {
        await tagApi.update(selectedTag.id, data as UpdateTagDto)
        setSuccess('Tag updated successfully')
      }

      fetchTags()
    } catch (err: any) {
      setError(err.message || 'Failed to save tag')
      throw err
    }
  }

  const handleOpenDeleteDialog = (id: string) => {
    const tag = tags.find(t => t.id === id)

    if (tag) {
      setTagToDelete(tag)
      setDeleteDialogOpen(true)
    }
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setTagToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return

    try {
      setError(null)
      await tagApi.delete(tagToDelete.id)
      setSuccess('Tag deleted successfully')
      handleCloseDeleteDialog()
      fetchTags()
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag')
    }
  }



  return (
    <Box>
      {/* Alerts */}
      {error && (
        <Alert
          severity='error'
          onClose={() => setError(null)}
          sx={{
            mb: 2,
            '& .MuiAlert-message': {
              color: 'white',
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity='success'
          onClose={() => setSuccess(null)}
          sx={{
            mb: 2,
            '& .MuiAlert-message': {
              color: 'Black',
              fontWeight: 500
            }
          }}
        >
          {success}
        </Alert>
      )}

      {/* Tags Table */}
      <TagTableNew
        tags={tags}
        totalItems={totalItems}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
        onAdd={handleOpenAddModal}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        loading={loading}
      />

      {/* Add/Edit Tag Modal */}
      <TagModalNew
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTag}
        tag={selectedTag}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tag &quot;{tagToDelete?.tagName}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TagsPage
