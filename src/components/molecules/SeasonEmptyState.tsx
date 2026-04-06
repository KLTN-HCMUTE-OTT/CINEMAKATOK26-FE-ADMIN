'use client'

// MUI Imports
import { Card, CardContent, Box, Typography } from '@mui/material'

interface SeasonEmptyStateProps {
  titleType: string
}

const SeasonEmptyState = ({ titleType }: SeasonEmptyStateProps) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant='h6' color='text.secondary'>
            Season management is only available for Series content
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            This title is marked as "{titleType}". Change the content type to "Series" to enable season management.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SeasonEmptyState
