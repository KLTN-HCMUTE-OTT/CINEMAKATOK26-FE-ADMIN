import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface ReporterInfoProps {
  reporter: Record<string, any>
}

const ReporterInfo = ({ reporter }: ReporterInfoProps) => {
  return (
    <Box>
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        {reporter?.name || reporter?.username || 'Unknown'}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {reporter?.email || 'No email'}
      </Typography>
    </Box>
  )
}

export default ReporterInfo
