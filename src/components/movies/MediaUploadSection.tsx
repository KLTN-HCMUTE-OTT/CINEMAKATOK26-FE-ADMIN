'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

interface MediaUploadSectionProps {
  thumbnail: string
  banner: string
  uploadingThumbnail: boolean
  uploadingBanner: boolean
  onThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveThumbnail: () => void
  onRemoveBanner: () => void
}

const MediaUploadSection = ({
  thumbnail,
  banner,
  uploadingThumbnail,
  uploadingBanner,
  onThumbnailUpload,
  onBannerUpload,
  onRemoveThumbnail,
  onRemoveBanner
}: MediaUploadSectionProps) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography variant='h6' gutterBottom>
          Media
        </Typography>
      </Grid>

      {/* Thumbnail Upload */}
      <Grid item xs={12} sm={6}>
        <Box>
          <Typography variant='body2' gutterBottom>
            Thumbnail
          </Typography>
          {thumbnail ? (
            <Box>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  mb: 2
                }}
              >
                <img
                  src={thumbnail}
                  alt='Thumbnail'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Box display='flex' gap={1}>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='ri-eye-line' />}
                  onClick={() => window.open(thumbnail, '_blank')}
                >
                  View
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  color='error'
                  startIcon={<i className='ri-delete-bin-line' />}
                  onClick={onRemoveThumbnail}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ) : (
            <Button variant='outlined' component='label' fullWidth disabled={uploadingThumbnail}>
              {uploadingThumbnail ? <CircularProgress size={20} /> : <i className='ri-upload-2-line' />}
              <span style={{ marginLeft: '8px' }}>{uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}</span>
              <input type='file' hidden accept='image/*' onChange={onThumbnailUpload} />
            </Button>
          )}
        </Box>
      </Grid>

      {/* Banner Upload */}
      <Grid item xs={12} sm={6}>
        <Box>
          <Typography variant='body2' gutterBottom>
            Banner
          </Typography>
          {banner ? (
            <Box>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  mb: 2
                }}
              >
                <img
                  src={banner}
                  alt='Banner'
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Box display='flex' gap={1}>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='ri-eye-line' />}
                  onClick={() => window.open(banner, '_blank')}
                >
                  View
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  color='error'
                  startIcon={<i className='ri-delete-bin-line' />}
                  onClick={onRemoveBanner}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ) : (
            <Button variant='outlined' component='label' fullWidth disabled={uploadingBanner}>
              {uploadingBanner ? <CircularProgress size={20} /> : <i className='ri-upload-2-line' />}
              <span style={{ marginLeft: '8px' }}>{uploadingBanner ? 'Uploading...' : 'Upload Banner'}</span>
              <input type='file' hidden accept='image/*' onChange={onBannerUpload} />
            </Button>
          )}
        </Box>
      </Grid>
    </>
  )
}

export default MediaUploadSection
