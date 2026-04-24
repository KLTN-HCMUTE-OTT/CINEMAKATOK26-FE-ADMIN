'use client'

// MUI Imports
import { Card, CardContent, Typography, Grid, Button, Box, Alert, CircularProgress } from '@mui/material'

import { useTVSeriesMetadataForm } from '../../hooks/useTVSeriesMetadataForm'
import BasicMetadataSection from './metadata-sections/BasicMetadataSection'
import GenreSection from './metadata-sections/GenreSection'
import CastSection from './metadata-sections/CastSection'

interface TVSeriesMetadataFormProps {
  initialData?: any
  onComplete: (metadata: any) => void
}

const TVSeriesMetadataForm = ({ initialData, onComplete }: TVSeriesMetadataFormProps) => {
  const {
    metadata,
    categories,
    tags,
    actors,
    directors,
    loading,
    error,
    uploadingThumbnail,
    uploadingBanner,
    handleChange,
    handleThumbnailUpload,
    handleBannerUpload,
    isFormValid
  } = useTVSeriesMetadataForm({ initialData })

  const handleSubmit = () => {
    if (isFormValid()) {
      onComplete(metadata)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
          TV Series Information
        </Typography>

        <Grid container spacing={3}>
          <BasicMetadataSection
            metadata={metadata}
            uploadingThumbnail={uploadingThumbnail}
            uploadingBanner={uploadingBanner}
            onChange={handleChange}
            onThumbnailUpload={handleThumbnailUpload}
            onBannerUpload={handleBannerUpload}
          />

          <GenreSection metadata={metadata} categories={categories} tags={tags} onChange={handleChange} />

          <CastSection metadata={metadata} actors={actors} directors={directors} onChange={handleChange} />

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
              <Button
                variant='contained'
                size='large'
                onClick={handleSubmit}
                disabled={!isFormValid()}
                startIcon={<i className='ri-arrow-right-line' />}
              >
                Continue to Seasons & Episodes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TVSeriesMetadataForm
