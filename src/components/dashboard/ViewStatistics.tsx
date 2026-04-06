'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

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
  Button,
  TextField,
  TablePagination,
  Alert
} from '@mui/material'

// Hook Imports
import { useViewStatistics } from '@/hooks/useViewStatistics'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`viewstats-tabpanel-${index}`}
      aria-labelledby={`viewstats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

interface ViewStatisticsProps {
  exportToExcel?: (data: any[], headers: string[], fileName: string, sheetName: string) => void
}

const ViewStatistics = ({ exportToExcel }: ViewStatisticsProps) => {
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const router = useRouter()

  // Use the API hook
  const {
    data: currentData,
    loading,
    error,
    totalItems
  } = useViewStatistics({
    tabValue,
    page,
    rowsPerPage,
    searchQuery
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPage(0) // Reset page when tab changes
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPage(0) // Reset page when search changes
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleItemClick = (item: any) => {
    if (tabValue === 0) {
      // Movies tab - navigate to movie detail
      router.push(`/content/movies/${item.id}`)
    } else if (tabValue === 1) {
      // TV Series tab - navigate to TV series detail
      router.push(`/content/tvseries/${item.id}`)
    }
    // Categories tab - no navigation
  }

  const handleExport = () => {
    const tabName = ['Movies', 'TV Series', 'Categories'][tabValue]
    const headers =
      tabValue === 2
        ? ['Name', 'Views', 'Trend', 'Change', 'Percentage']
        : ['Title', 'Views', 'Trend', 'Change', 'Percentage']

    if (exportToExcel && currentData) {
      const exportData = currentData.map((item: any) => ({
        ...item,
        Title: (item as any).title || (item as any).name,
        Name: (item as any).name || (item as any).title,
        Views: item.views,
        Trend: item.trending,
        Change: item.change,
        Percentage: item.percentage
      }))

      exportToExcel(exportData, headers, `ViewStatistics_${tabName}`, tabName)
    }
  }

  // Calculate summary stats from current data
  const getTotalViews = () => {
    return currentData?.reduce((sum, item) => sum + item.views, 0) || 0
  }

  // Get top content name based on current tab
  const getTopContentName = () => {
    if (!currentData || currentData.length === 0) return 'N/A'

    if (tabValue === 2) {
      // Categories tab
      return (currentData[0] as any)?.name || 'N/A'
    } else {
      // Movies and TV Series tabs
      return (currentData[0] as any)?.title || 'N/A'
    }
  }

  const totalViews = getTotalViews()

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='View Statistics'
        subheader='Monitor content performance across different categories'
        avatar={<i className='ri-bar-chart-2-line' style={{ fontSize: '24px', color: '#1976d2' }} />}
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
        {/* Error Alert */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search by title or category...'
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <i className='ri-search-line' style={{ marginRight: 8, color: '#666' }} />
            }}
          />
        </Box>

        {/* Summary Stats */}
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
                  {getTopContentName()}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Avg. Views per Item
                </Typography>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  {currentData && currentData.length > 0 ? Math.round(totalViews / currentData.length) : 0}
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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label='view statistics tabs'>
            <Tab label='Movies' id='viewstats-tab-0' aria-controls='viewstats-tabpanel-0' />
            <Tab label='TV Series' id='viewstats-tab-1' aria-controls='viewstats-tabpanel-1' />
            <Tab label='Categories' id='viewstats-tab-2' aria-controls='viewstats-tabpanel-2' />
          </Tabs>
        </Box>

        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        ) : (
          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>
                      Views
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>
                      Trend
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData?.map((row: any) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 500,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                          }}
                          onClick={() => handleItemClick(row)}
                        >
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {row.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Chip
                          label={row.change}
                          size='small'
                          color={row.trending === 'up' ? 'success' : 'error'}
                          variant='outlined'
                          icon={
                            <i
                              className={`ri-arrow-${row.trending === 'up' ? 'up' : 'down'}-s-line`}
                              style={{ fontSize: '16px' }}
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant='determinate' value={row.percentage} sx={{ flex: 1 }} />
                          <Typography variant='caption' sx={{ minWidth: '30px' }}>
                            {row.percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TabPanel>
        )}

        {loading ? null : (
          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>
                      Views
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>
                      Trend
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData?.map((row: any) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 500,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                          }}
                          onClick={() => handleItemClick(row)}
                        >
                          {row.title}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {row.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Chip
                          label={row.change}
                          size='small'
                          color={row.trending === 'up' ? 'success' : 'error'}
                          variant='outlined'
                          icon={
                            <i
                              className={`ri-arrow-${row.trending === 'up' ? 'up' : 'down'}-s-line`}
                              style={{ fontSize: '16px' }}
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant='determinate' value={row.percentage} sx={{ flex: 1 }} />
                          <Typography variant='caption' sx={{ minWidth: '30px' }}>
                            {row.percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TabPanel>
        )}

        {loading ? null : (
          <TabPanel value={tabValue} index={2}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>
                      Views
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600 }}>
                      Trend
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentData?.map((row: any) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {(row as any).title || (row as any).name}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {row.views.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Chip
                          label={row.change}
                          size='small'
                          color={row.trending === 'up' ? 'success' : 'error'}
                          variant='outlined'
                          icon={
                            <i
                              className={`ri-arrow-${row.trending === 'up' ? 'up' : 'down'}-s-line`}
                              style={{ fontSize: '16px' }}
                            />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant='determinate' value={row.percentage} sx={{ flex: 1 }} />
                          <Typography variant='caption' sx={{ minWidth: '30px' }}>
                            {row.percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component='div'
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TabPanel>
        )}
      </CardContent>
    </Card>
  )
}

export default ViewStatistics
