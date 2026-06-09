import { Box, Grid, Typography } from '@mui/material'

interface ViewStatSummaryProps {
  totalViews: number
  topContentName: string
  totalItems: number
  currentDataLength: number
}

const ViewStatSummary = ({ totalViews, topContentName, totalItems, currentDataLength }: ViewStatSummaryProps) => {
  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Total Views
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {totalViews.toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Top Content
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {topContentName}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Avg. Views per Item
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {currentDataLength > 0 ? Math.round(totalViews / currentDataLength) : 0}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Total Items
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {totalItems}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ViewStatSummary
