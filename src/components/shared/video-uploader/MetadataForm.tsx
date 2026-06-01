// MUI Imports
import { Card, CardContent, Typography, Grid, Box, Button, LinearProgress, FormHelperText } from '@mui/material'

import MetadataBasicFields from './MetadataBasicFields'
import MetadataPeopleAndTaxonomy from './MetadataPeopleAndTaxonomy'
import type { VideoMetadata, MetadataErrors } from './types'

interface MetadataFormProps {
  metadata: VideoMetadata
  categories: any[]
  tags: any[]
  actors: any[]
  directors: any[]
  loading: boolean
  uploadingThumbnail: boolean
  uploadingBanner: boolean
  errors?: MetadataErrors
  onMetadataChange: (metadata: VideoMetadata) => void
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const MetadataForm = ({
  metadata,
  categories,
  tags,
  actors,
  directors,
  loading,
  uploadingThumbnail,
  uploadingBanner,
  errors = {},
  onMetadataChange,
  onThumbnailUpload,
  onBannerUpload
}: MetadataFormProps) => {
  const setMetadata = onMetadataChange

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3 }}>
          Content Metadata
        </Typography>
        <Grid container spacing={2}>
          <MetadataBasicFields metadata={metadata} errors={errors} onMetadataChange={setMetadata} />

          {/* Thumbnail Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Thumbnail Image
              </Typography>
              <input
                type='file'
                accept='image/*'
                onChange={onThumbnailUpload}
                style={{ display: 'none' }}
                id='thumbnail-upload-input'
                disabled={uploadingThumbnail}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label htmlFor='thumbnail-upload-input'>
                  <Button
                    variant='outlined'
                    component='span'
                    startIcon={
                      uploadingThumbnail ? (
                        <i className='ri-loader-4-line animate-spin' />
                      ) : (
                        <i className='ri-image-add-line' />
                      )
                    }
                    disabled={uploadingThumbnail}
                  >
                    {uploadingThumbnail ? 'Uploading...' : 'Choose Thumbnail'}
                  </Button>
                </label>
                {metadata.thumbnail && !uploadingThumbnail && (
                  <>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      onClick={() => setMetadata({ ...metadata, thumbnail: '' })}
                      startIcon={<i className='ri-delete-bin-line' />}
                    >
                      Remove
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => window.open(metadata.thumbnail, '_blank')}
                      startIcon={<i className='ri-eye-line' />}
                    >
                      Preview
                    </Button>
                  </>
                )}
              </Box>
              {metadata.thumbnail && !uploadingThumbnail && (
                <Box sx={{ mt: 2, maxWidth: 200 }}>
                  <img
                    src={metadata.thumbnail}
                    alt='Thumbnail preview'
                    style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </Box>
              )}
              {uploadingThumbnail && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                    Uploading to Cloudinary...
                  </Typography>
                </Box>
              )}
              {errors.thumbnail ? (
                <FormHelperText error sx={{ mt: 0.5 }}>{errors.thumbnail}</FormHelperText>
              ) : (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                  Upload thumbnail image for the content
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Banner Upload */}
          <Grid item xs={12}>
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Banner Image
              </Typography>
              <input
                type='file'
                accept='image/*'
                onChange={onBannerUpload}
                style={{ display: 'none' }}
                id='banner-upload-input'
                disabled={uploadingBanner}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <label htmlFor='banner-upload-input'>
                  <Button
                    variant='outlined'
                    component='span'
                    startIcon={
                      uploadingBanner ? (
                        <i className='ri-loader-4-line animate-spin' />
                      ) : (
                        <i className='ri-image-add-line' />
                      )
                    }
                    disabled={uploadingBanner}
                  >
                    {uploadingBanner ? 'Uploading...' : 'Choose Banner'}
                  </Button>
                </label>
                {metadata.banner && !uploadingBanner && (
                  <>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      onClick={() => setMetadata({ ...metadata, banner: '' })}
                      startIcon={<i className='ri-delete-bin-line' />}
                    >
                      Remove
                    </Button>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => window.open(metadata.banner, '_blank')}
                      startIcon={<i className='ri-eye-line' />}
                    >
                      Preview
                    </Button>
                  </>
                )}
              </Box>
              {metadata.banner && !uploadingBanner && (
                <Box sx={{ mt: 2, maxWidth: 400 }}>
                  <img
                    src={metadata.banner}
                    alt='Banner preview'
                    style={{ width: '100%', height: 'auto', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </Box>
              )}
              {uploadingBanner && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress />
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                    Uploading to Cloudinary...
                  </Typography>
                </Box>
              )}
              {errors.banner ? (
                <FormHelperText error sx={{ mt: 0.5 }}>{errors.banner}</FormHelperText>
              ) : (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                  Upload banner image for the content
                </Typography>
              )}
            </Box>
          </Grid>

          <MetadataPeopleAndTaxonomy
            metadata={metadata}
            categories={categories}
            tags={tags}
            actors={actors}
            directors={directors}
            loading={loading}
            errors={errors}
            onMetadataChange={setMetadata}
          />
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MetadataForm
