import {
  Box,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'

interface ViewStatTableProps {
  tabValue: number
  currentData: any[]
  totalItems: number
  page: number
  rowsPerPage: number
  onPageChange: (_event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onItemClick: (item: any) => void
}

const ViewStatTable = ({
  tabValue,
  currentData,
  totalItems,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onItemClick
}: ViewStatTableProps) => {
  const headerLabel = tabValue === 2 ? 'Category' : 'Title'

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>{headerLabel}</TableCell>
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
                      cursor: tabValue !== 2 ? 'pointer' : 'default',
                      '&:hover':
                        tabValue !== 2
                          ? {
                              color: 'primary.main',
                              textDecoration: 'underline'
                            }
                          : undefined
                    }}
                    onClick={() => {
                      if (tabValue !== 2) {
                        onItemClick(row)
                      }
                    }}
                  >
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
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  )
}

export default ViewStatTable
