// MUI Imports
import { Box, Typography, Card, CardContent, Button } from '@mui/material'

interface UploadDropzoneProps {
  isDragActive: boolean
  acceptedFormats: string[]
  maxFileSize: number
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const UploadDropzone = ({
  isDragActive,
  acceptedFormats,
  maxFileSize,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect
}: UploadDropzoneProps) => {
  return (
    <Card
      sx={{
        border: isDragActive ? '2px dashed' : '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 2 }}>
          <i className='ri-upload-cloud-2-line text-4xl text-gray-400' />
        </Box>
        <Typography variant='h6' sx={{ mb: 1 }}>
          Drop video files here or click to browse
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Supported formats: {acceptedFormats.join(', ')} | Max size: {maxFileSize}MB
        </Typography>
        <input
          type='file'
          multiple
          accept={acceptedFormats.join(',')}
          onChange={onFileSelect}
          style={{ display: 'none' }}
          id='video-upload-input'
        />
        <label htmlFor='video-upload-input'>
          <Button variant='contained' component='span'>
            Choose Files
          </Button>
        </label>
      </CardContent>
    </Card>
  )
}

export default UploadDropzone
