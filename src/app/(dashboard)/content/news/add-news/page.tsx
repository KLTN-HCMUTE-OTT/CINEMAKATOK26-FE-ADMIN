'use client'

import { useState, useRef } from 'react'

import { useRouter } from 'next/navigation'

import dynamic from 'next/dynamic'

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText
} from '@mui/material'

import { newsControllerCreate } from '@/api/news'
import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/configs/cloudinary'

// Import BlogEditor
const BlogEditor = dynamic(() => import('@/components/textEditor/BlogEditor'), { ssr: false })

const AddNewsPage = () => {
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    cover_image: '',
    category: [] as string[]
  })

  const [content, setContent] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const editorRef = useRef<any>(null)

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()

    formDataUpload.append('file', file)
    formDataUpload.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formDataUpload
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()

    return data.secure_url
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select a valid image file',
        severity: 'error'
      })

      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: 'Image size must be less than 5MB',
        severity: 'error'
      })

      return
    }

    try {
      setUploadingImage(true)
      const url = await uploadImageToCloudinary(file)

      setFormData(prev => ({ ...prev, cover_image: url }))

      if (errors.cover_image) {
        setErrors(prev => ({ ...prev, cover_image: '' }))
      }

      setSnackbar({
        open: true,
        message: 'Image uploaded successfully!',
        severity: 'success'
      })
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setSnackbar({
        open: true,
        message: err.message || 'Failed to upload image',
        severity: 'error'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle add category
  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.category.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, categoryInput.trim()]
      }))
      setCategoryInput('')
    }
  }

  // Handle remove category
  const handleRemoveCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter(cat => cat !== categoryToRemove)
    }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.summary.trim()) newErrors.summary = 'Summary is required'
    if (!formData.cover_image.trim()) newErrors.cover_image = 'Cover image is required'
    if (formData.category.length === 0) newErrors.category = 'At least one category is required'

    // Check if content is empty
    const contentHtml = editorRef.current?.getHTML() || ''

    if (!contentHtml || contentHtml === '<p></p>' || contentHtml.trim() === '') {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const newsData: API.CreateNewsDto = {
        title: formData.title,
        summary: formData.summary,
        content_html: content,
        cover_image: formData.cover_image,
        category: formData.category
      }

      const response = await newsControllerCreate(newsData)

      if (response.data.statusCode === 201) {
        setSnackbar({
          open: true,
          message: 'News created successfully!',
          severity: 'success'
        })
        setTimeout(() => {
          router.push('/content/news')
        }, 1500)
      }
    } catch (err: any) {
      console.error('Error creating news:', err)
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || 'Failed to create news',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
            Add News
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Create a new news article
          </Typography>
        </Box>
        <Button variant='outlined' startIcon={<i className='ri-arrow-left-line' />} onClick={() => router.back()}>
          Back
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Title */}
              <TextField
                fullWidth
                label='Title'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                sx={{ mb: 3 }}
              />

              {/* Summary */}
              <TextField
                fullWidth
                label='Summary'
                multiline
                rows={3}
                value={formData.summary}
                onChange={e => handleInputChange('summary', e.target.value)}
                error={!!errors.summary}
                helperText={errors.summary}
                sx={{ mb: 3 }}
              />

              {/* Content Editor */}
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Content
                </Typography>
                <BlogEditor
                  content={content}
                  onChange={() => {
                    const html = editorRef.current?.getHTML() || ''

                    setContent(html)
                  }}
                  editorRef={(editor: any) => {
                    editorRef.current = editor
                  }}
                  error={errors.content}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Cover Image */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2 }}>
                Cover Image
              </Typography>

              <Button
                fullWidth
                variant='outlined'
                component='label'
                startIcon={uploadingImage ? <CircularProgress size={20} /> : <i className='ri-upload-cloud-line' />}
                disabled={uploadingImage}
                sx={{ mb: 2 }}
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                <input type='file' hidden accept='image/*' onChange={handleImageUpload} />
              </Button>

              {errors.cover_image && !formData.cover_image && (
                <FormHelperText error>{errors.cover_image}</FormHelperText>
              )}

              {formData.cover_image && (
                <Box sx={{ position: 'relative', mt: 2 }}>
                  <Box
                    component='img'
                    src={formData.cover_image}
                    alt='Cover preview'
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                  <Button
                    variant='contained'
                    color='error'
                    size='small'
                    startIcon={<i className='ri-delete-bin-line' />}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='subtitle2' sx={{ mb: 2 }}>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Add category'
                  value={categoryInput}
                  onChange={e => setCategoryInput(e.target.value)}
                  error={!!errors.category}
                />
                <Button variant='contained' onClick={handleAddCategory}>
                  Add
                </Button>
              </Box>
              {errors.category && <FormHelperText error>{errors.category}</FormHelperText>}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.category.map((cat, index) => (
                  <Chip key={index} label={cat} onDelete={() => handleRemoveCategory(cat)} color='primary' />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Button
                fullWidth
                variant='contained'
                size='large'
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
              >
                {loading ? 'Creating...' : 'Create News'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AddNewsPage
