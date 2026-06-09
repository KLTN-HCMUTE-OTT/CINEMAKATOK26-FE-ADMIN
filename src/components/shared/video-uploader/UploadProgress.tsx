// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button
} from '@mui/material'

// Components Imports
import StatusBadge from '../StatusBadge'

interface VideoFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'transcoding' | 'ready' | 'error'
  quality?: string
  duration?: string
  durationInMinutes?: number
  thumbnail?: string
  videoData?: any
  file?: File
}

interface UploadProgressProps {
  uploadingFiles: VideoFile[]
  existingFiles: VideoFile[]
  onDeleteFile: (fileId: string) => void
  onProcessVideos: () => void
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const UploadProgress = ({ uploadingFiles, existingFiles, onDeleteFile, onProcessVideos }: UploadProgressProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3 }}>
          Upload Progress
        </Typography>

        {uploadingFiles.length === 0 && existingFiles.length === 0 && (
          <Alert severity='info'>No files uploaded yet</Alert>
        )}

        {/* Uploading Files */}
        {uploadingFiles.map(file => (
          <Box key={file.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='body2' noWrap sx={{ maxWidth: '60%' }}>
                {file.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StatusBadge status={file.status} />
                <Typography variant='caption'>{Math.round(file.progress)}%</Typography>
              </Box>
            </Box>
            <LinearProgress variant='determinate' value={file.progress} sx={{ mb: 1 }} />
            <Typography variant='caption' color='text.secondary'>
              {formatFileSize(file.size)}
            </Typography>
          </Box>
        ))}

        {/* Existing Files */}
        <List dense>
          {existingFiles.map(file => (
            <ListItem key={file.id}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2' noWrap>
                      {file.name}
                    </Typography>
                    <StatusBadge status={file.status} />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip label={file.quality} size='small' />
                    <Typography variant='caption'>{formatFileSize(file.size)}</Typography>
                    {file.duration && <Typography variant='caption'>{file.duration}</Typography>}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge='end' size='small' color='error' onClick={() => onDeleteFile(file.id)}>
                  <i className='ri-delete-bin-line' />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {(uploadingFiles.length > 0 || existingFiles.length > 0) && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant='contained'
              fullWidth
              onClick={onProcessVideos}
              disabled={uploadingFiles.some(f => f.status === 'uploading')}
            >
              Process Videos
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default UploadProgress
