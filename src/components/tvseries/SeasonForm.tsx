'use client'

// MUI Imports
import { Grid, Button, Box } from '@mui/material'

interface SeasonFormProps {
  season: {
    seasonNumber: number
  }
  onSave: (data: { seasonNumber: number }) => void
  onCancel: () => void
}

const SeasonForm = ({ season, onSave, onCancel }: SeasonFormProps) => {
  const handleSubmit = () => {
    onSave({ seasonNumber: season.seasonNumber })
  }

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant='contained' onClick={handleSubmit}>
              Save Season
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SeasonForm
