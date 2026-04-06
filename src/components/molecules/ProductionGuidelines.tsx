'use client'

// MUI Imports
import { Grid, Typography, Box, Divider } from '@mui/material'

const ProductionGuidelines = () => {
  return (
    <Grid item xs={12}>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          Production Guidelines:
        </Typography>
        <Typography variant='body2' color='text.secondary' component='div'>
          <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
            <li>Episode titles should be unique and memorable</li>
            <li>Description should be 50-150 words without major spoilers</li>
            <li>Duration should match actual video length</li>
            <li>Release date affects scheduling and availability</li>
            <li>Thumbnail should be 16:9 aspect ratio (1920x1080px recommended)</li>
            <li>Video assets represent available streaming qualities</li>
            <li>Subtitles improve accessibility and global reach</li>
          </ul>
        </Typography>
      </Box>
    </Grid>
  )
}

export default ProductionGuidelines
