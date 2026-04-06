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
  Avatar,
  AvatarGroup,
  LinearProgress,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Alert
} from '@mui/material'

// Hook Imports
import { useUserStatistics } from '@/hooks/useUserStatistics'

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
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

interface UserStatisticsProps {
  exportToExcel?: (data: any[], headers: string[], fileName: string, sheetName: string) => void
  exportMultipleSheets?: (sheetsData: any[], fileName: string) => void
}

const UserStatistics = ({ exportToExcel, exportMultipleSheets }: UserStatisticsProps) => {
  const [tabValue, setTabValue] = useState(0)

  // Use the API hook
  const { data: userStatsData, loading, error } = useUserStatistics()
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleExport = () => {
    if (!userStatsData) return

    if (tabValue === 0 && exportToExcel) {
      // Export DAU
      const dauHeaders = ['Day', 'Active Users', 'Trend', 'Distribution %']
      const dauData = (userStatsData.userMetrics?.dau || []).map((row: API.DAUMetricDto) => ({
        Day: row.day,
        'Active Users': row.users,
        Trend: row.trend,
        'Distribution %': Math.round((row.users / (userStatsData.summary?.totalUsers || 55400)) * 100)
      }))
      exportToExcel(dauData, dauHeaders, 'UserStatistics_DAU', 'DAU')
    } else if (tabValue === 1 && exportToExcel) {
      // Export MAU
      const mauHeaders = ['Month', 'Active Users', 'Change', 'Growth %']
      const mauData = (userStatsData.userMetrics?.mau || []).map((row: API.MAUMetricDto) => ({
        Month: row.month,
        'Active Users': row.users,
        Change: row.change,
        'Growth %': Math.round((row.users / (userStatsData.summary?.totalUsers || 152845)) * 100)
      }))
      exportToExcel(mauData, mauHeaders, 'UserStatistics_MAU', 'MAU')
    } else if (tabValue === 2 && exportToExcel) {
      // Export Churn Rate
      const churnHeaders = ['Month', 'Churn Rate (%)', 'Trend', 'Status']
      const churnData = (userStatsData.userMetrics?.churnRate || []).map((row: API.ChurnRateMetricDto) => ({
        Month: row.month,
        'Churn Rate (%)': row.rate,
        Trend: row.trend === 'down' ? 'Improving' : 'Worsening',
        Status: row.rate > 3 ? 'Critical' : row.rate > 2 ? 'Warning' : 'Healthy'
      }))
      exportToExcel(churnData, churnHeaders, 'UserStatistics_ChurnRate', 'ChurnRate')
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='User Statistics'
        subheader='Track user growth and subscription plans'
        avatar={<i className='ri-team-line' style={{ fontSize: '24px', color: '#10b981' }} />}
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

        {/* Summary Stats */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Total Users
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {userStatsData?.summary?.totalUsers?.toLocaleString() || '0'}
                </Typography>
                <Typography variant='caption' sx={{ color: 'success.main' }}>
                  Active platform
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Active Users
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {userStatsData?.summary?.activeUsers?.toLocaleString() || '0'}
                </Typography>
                <Typography variant='caption' sx={{ color: 'info.main' }}>
                  {userStatsData?.summary?.totalUsers && userStatsData?.summary?.activeUsers
                    ? ((userStatsData.summary.activeUsers / userStatsData.summary.totalUsers) * 100).toFixed(1)
                    : '0'}
                  % of total
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  New Users (30d)
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {userStatsData?.summary?.newUsers?.toLocaleString() || '0'}
                </Typography>
                <Typography variant='caption' sx={{ color: 'warning.main' }}>
                  Monthly acquisition
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Churn Rate
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 600, mt: 0.5 }}>
                  {userStatsData?.summary?.churnRate || '0'}%
                </Typography>
                <Typography variant='caption' sx={{ color: 'error.main' }}>
                  Monthly churn
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* DAU, MAU, Churn Rate Metrics */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            User Activity Metrics
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label='user metrics tabs'>
              <Tab label='DAU (Daily Active Users)' id='user-tab-0' aria-controls='user-tabpanel-0' />
              <Tab label='MAU (Monthly Active Users)' id='user-tab-1' aria-controls='user-tabpanel-1' />
              <Tab label='Churn Rate' id='user-tab-2' aria-controls='user-tabpanel-2' />
            </Tabs>
          </Box>

          {loading ? (
            <Box display='flex' justifyContent='center' alignItems='center' minHeight='250px'>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* DAU Tab */}
              <TabPanel value={tabValue} index={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600 }}>
                          Active Users
                        </TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600 }}>
                          Trend
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Distribution</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userStatsData?.userMetrics?.dau?.map((row: API.DAUMetricDto, idx: number) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {row.day}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {row.users?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Chip
                              label={row.trend === 'up' ? '↑ Up' : '↓ Down'}
                              size='small'
                              color={row.trend === 'up' ? 'success' : 'error'}
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant='determinate'
                                value={(row.users / (userStatsData?.summary?.totalUsers || 55400)) * 100}
                                sx={{ flex: 1 }}
                              />
                              <Typography variant='caption' sx={{ minWidth: '30px' }}>
                                {Math.round((row.users / (userStatsData?.summary?.totalUsers || 55400)) * 100)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* MAU Tab */}
              <TabPanel value={tabValue} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600 }}>
                          Active Users
                        </TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600 }}>
                          Change
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Growth</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userStatsData?.userMetrics?.mau?.map((row: API.MAUMetricDto, idx: number) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {row.month}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {row.users?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Chip
                              label={row.change}
                              size='small'
                              color={row.trend === 'up' ? 'success' : 'error'}
                              variant='outlined'
                              icon={
                                <i
                                  className={`ri-arrow-${row.trend === 'up' ? 'up' : 'down'}-s-line`}
                                  style={{ fontSize: '16px' }}
                                />
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant='determinate'
                                value={(row.users / (userStatsData?.summary?.totalUsers || 152845)) * 100}
                                sx={{ flex: 1 }}
                              />
                              <Typography variant='caption' sx={{ minWidth: '30px' }}>
                                {Math.round((row.users / (userStatsData?.summary?.totalUsers || 152845)) * 100)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              {/* Churn Rate Tab */}
              <TabPanel value={tabValue} index={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600 }}>
                          Churn Rate (%)
                        </TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600 }}>
                          Trend
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userStatsData?.userMetrics?.churnRate?.map((row: API.ChurnRateMetricDto, idx: number) => (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {row.month}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                color: row.rate > 3 ? 'error.main' : row.rate > 2 ? 'warning.main' : 'success.main'
                              }}
                            >
                              {row.rate}%
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Chip
                              label={row.trend === 'down' ? '↓ Improving' : '↑ Worsening'}
                              size='small'
                              color={row.trend === 'down' ? 'success' : 'error'}
                              variant='outlined'
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.rate > 3 ? 'Critical' : row.rate > 2 ? 'Warning' : 'Healthy'}
                              size='small'
                              color={row.rate > 3 ? 'error' : row.rate > 2 ? 'warning' : 'success'}
                              variant='filled'
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default UserStatistics
