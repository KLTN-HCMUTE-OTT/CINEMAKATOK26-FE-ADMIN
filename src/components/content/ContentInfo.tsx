import { Box, Chip, Divider, Typography } from '@mui/material'

interface ContentInfoProps {
  title: string
  type: string
  status?: string
  description?: string
}

export const ContentInfo = ({ title, type, status, description }: ContentInfoProps) => {
  return (
    <>
      <Typography variant='h5' gutterBottom>
        {title}
      </Typography>

      {/* Type and Status */}
      <Box display='flex' gap={2} mb={3}>
        <Chip label={type} color='primary' size='small' />
        {status && <Chip label={status} color={status === 'READY' ? 'success' : 'default'} size='small' />}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Description */}
      <Typography variant='h6' gutterBottom>
        Description
      </Typography>
      <Typography variant='body1' color='text.secondary' paragraph>
        {description || 'No description available'}
      </Typography>

      <Divider sx={{ my: 3 }} />
    </>
  )
}
