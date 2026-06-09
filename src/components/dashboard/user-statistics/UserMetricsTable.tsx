import {
  Box,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'

interface UserMetricsTableProps {
  tabValue: number
  userStatsData: any
}

const UserMetricsTable = ({ tabValue, userStatsData }: UserMetricsTableProps) => {
  if (tabValue === 0) {
    return (
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
    )
  }

  if (tabValue === 1) {
    return (
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
    )
  }

  return (
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
  )
}

export default UserMetricsTable
