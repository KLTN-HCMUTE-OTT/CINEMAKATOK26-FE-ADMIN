'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'

// Components Imports
import CategoryTableNew from '@/components/content/CategoryTableNew'
import CategoryModalNew from '@/components/content/CategoryModalNew'

// API Imports
import { categoryApi, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '@/services'

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Search
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay - faster for real-time feel

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await categoryApi.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearchTerm || undefined
      })

      console.log('Categories API Response:', response.data)

      // Check if response and response.data exist and is an array
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.error('Invalid response structure:', response)
        setCategories([])
        setTotalItems(0)
        return
      }

      setCategories(response.data)
      setTotalItems(response.meta?.totalItems || response.data.length)
    } catch (err: any) {
      setError(err.message || 'Failed to load categories')
      console.error('Error fetching categories:', err)
      setCategories([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
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
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleOpenEditModal = (category: Category) => {
    setModalMode('edit')
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCategory(null)
  }

  const handleSaveCategory = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      setError(null)

      if (modalMode === 'create') {
        await categoryApi.create(data as CreateCategoryDto)
        setSuccess('Category created successfully')
      } else if (selectedCategory) {
        await categoryApi.update(selectedCategory.id, data as UpdateCategoryDto)
        setSuccess('Category updated successfully')
      }

      fetchCategories()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
      throw err
    }
  }

  const handleOpenDeleteDialog = (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category) {
      setCategoryToDelete(category)
      setDeleteDialogOpen(true)
    }
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      setError(null)
      await categoryApi.delete(categoryToDelete.id)
      setSuccess('Category deleted successfully')
      handleCloseDeleteDialog()
      fetchCategories()
    } catch (err: any) {
      setError(err.message || 'Failed to delete category')
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    )
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

      {/* Categories Table */}
      <CategoryTableNew
        categories={categories}
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
      />

      {/* Add/Edit Category Modal */}
      <CategoryModalNew
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        category={selectedCategory}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{categoryToDelete?.categoryName}"? This action cannot be
            undone.
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

export default CategoriesPage
