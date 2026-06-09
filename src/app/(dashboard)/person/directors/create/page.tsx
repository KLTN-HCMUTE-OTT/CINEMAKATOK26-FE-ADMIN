'use client'

// React Imports
import { useState } from 'react'

import { useRouter as useNextRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'

// API Imports
import { directorsControllerCreateDirector } from '@/api/directors'

// Config Imports
import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '@/configs/cloudinary'

const CreateDirectorPage = () => {
  const router = useNextRouter()

  // Form states
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE')
  const [bio, setBio] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [nationality, setNationality] = useState('')

  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
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

    try {
      setUploadingImage(true)
      const url = await uploadImageToCloudinary(file)

      setProfilePicture(url)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Failed to upload profile picture')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle submit
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validation
      if (!name.trim()) {
        setError('Name is required')
        
return
      }

      const directorData: API.CreateDirectorDto = {
        name: name.trim(),
        dateOfBirth: birthDate || '',
        gender: gender as any,
        bio: bio.trim(),
        profilePicture: profilePicture || '',
        nationality: nationality.trim()
      }

      await directorsControllerCreateDirector(directorData)

      // Redirect to directors list
      router.push('/person/directors')
    } catch (err: any) {
      console.error('Error creating director:', err)
      setError(err?.response?.data?.message || 'Failed to create director')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid container spacing={6}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h4'>Create Director</Typography>
          <Box display='flex' gap={2}>
            <Button
              variant='outlined'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={() => router.push('/person/directors')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              startIcon={loading ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Director'}
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Grid item xs={12}>
          <Alert severity='error' onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Form */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={4}>
              {/* Profile Picture */}
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom>
                  Profile Picture
                </Typography>
                <Box display='flex' alignItems='center' gap={3}>
                  <Avatar src={profilePicture} sx={{ width: 100, height: 150, borderRadius: 2 }} variant='rounded'>
                    {name?.[0] || 'D'}
                  </Avatar>
                  <Box>
                    <Button variant='outlined' component='label' disabled={uploadingImage}>
                      {uploadingImage ? <CircularProgress size={20} /> : <i className='ri-upload-2-line' />}
                      <span style={{ marginLeft: '8px' }}>{uploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                      <input type='file' hidden accept='image/*' onChange={handleImageUpload} />
                    </Button>
                    {profilePicture && (
                      <Button variant='text' color='error' onClick={() => setProfilePicture('')} sx={{ ml: 2 }}>
                        Remove
                      </Button>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant='h6' gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder='Enter director name'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Nationality'
                  value={nationality}
                  onChange={e => setNationality(e.target.value)}
                  placeholder='e.g., American, British'
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Birth Date'
                  type='date'
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select value={gender} onChange={e => setGender(e.target.value as any)} label='Gender'>
                    <MenuItem value='MALE'>Male</MenuItem>
                    <MenuItem value='FEMALE'>Female</MenuItem>
                    <MenuItem value='OTHER'>Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Biography'
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  multiline
                  rows={4}
                  placeholder='Enter director biography...'
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CreateDirectorPage
