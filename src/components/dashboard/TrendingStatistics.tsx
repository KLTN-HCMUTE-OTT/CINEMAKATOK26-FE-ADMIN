'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Rating,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  Alert,
  Paper
} from '@mui/material'

// Hook Imports
import { useTrendingStatistics } from '@/hooks/useTrendingStatistics'

interface TrendingStatisticsProps {
  exportToExcel?: (data: any[], headers: string[], fileName: string, sheetName: string) => void
}

const TrendingStatistics = ({ exportToExcel }: TrendingStatisticsProps) => {
  const [tabValue, setTabValue] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  // Use the API hook
  const {
    data: trendingData,
    loading,
    error,
    totalItems
  } = useTrendingStatistics({
    tabValue,
    page,
    rowsPerPage,
    searchQuery
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPage(1) // Reset to first page when switching tabs
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const handleExport = () => {
    const tabName = tabValue === 0 ? 'Movies' : 'TV Series'
    const headers = ['Title', 'Rating', 'Views', 'Trend', 'Change', 'Engagement %']

    if (exportToExcel) {
      const exportData = trendingData.map((row: API.TrendingItemDto) => ({
        Title: row.title,
        Rating: row.rating,
        Views: row.views,
        Trend: row.trend,
        Change: row.change,
        'Engagement %': row.engagement
      }))

      exportToExcel(exportData, headers, `TrendingStatistics_${tabName}`, tabName)
    }
  }

  // Calculate summary stats from API data
  const validEngagements = trendingData.filter(item => item.engagement != null && !isNaN(item.engagement))

  const avgEngagement =
    validEngagements.length > 0
      ? (validEngagements.reduce((sum, item) => sum + item.engagement, 0) / validEngagements.length).toFixed(1)
      : '0'

  const validViews = trendingData.filter(item => item.views != null && !isNaN(item.views))
  const topViews = validViews.length > 0 ? Math.max(...validViews.map(item => item.views)) : 0

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='Trending Content'
        subheader='Most popular content with engagement metrics'
        avatar={<i className='ri-fire-line' style={{ fontSize: '24px', color: '#f97316' }} />}
        action={
          <Button
            onClick={handleExport}
            variant='outlined'
            size='small'
            startIcon={<i className='ri-file-excel-2-line' />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Export CSV
          </Button>
        }
      />

      <CardContent>
        {/* Summary Stats */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Avg. Engagement
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {avgEngagement}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Total Trending
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {totalItems}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Top Content Views
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {topViews.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label='trending content tabs'>
            <Tab label='Movies' />
            <Tab label='TV Series' />
          </Tabs>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder='Search by title...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
            size='small'
          />
        </Box>

        {/* Data Table */}
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align='center'>Rating</TableCell>
                <TableCell align='center'>Views</TableCell>
                <TableCell align='center'>Trend</TableCell>
                <TableCell align='center'>Change</TableCell>
                <TableCell align='center'>Engagement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <Alert severity='error' sx={{ my: 2 }}>
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : trendingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    No trending content found
                  </TableCell>
                </TableRow>
              ) : (
                trendingData.map((row: API.TrendingItemDto) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {row.title}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {tabValue === 0 ? 'Movie' : 'TV Series'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Typography variant='body2'>{row.rating}</Typography>
                        <Rating value={row.rating} precision={0.1} readOnly size='small' />
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2'>{row.views.toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={row.trend}
                        color={row.trend === 'up' ? 'success' : row.trend === 'down' ? 'error' : 'default'}
                        size='small'
                        icon={
                          row.trend === 'up' ? (
                            <i className='ri-arrow-up-line' />
                          ) : row.trend === 'down' ? (
                            <i className='ri-arrow-down-line' />
                          ) : undefined
                        }
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <Typography
                        variant='body2'
                        color={
                          parseFloat(row.change) > 0
                            ? 'success.main'
                            : parseFloat(row.change) < 0
                              ? 'error.main'
                              : 'text.secondary'
                        }
                      >
                        {parseFloat(row.change) > 0 ? '+' : ''}
                        {row.change}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant='determinate' value={row.engagement} sx={{ width: 60, height: 6 }} />
                        <Typography variant='body2'>{row.engagement}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalItems > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(totalItems / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color='primary'
              size='medium'
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default TrendingStatistics
