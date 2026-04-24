'use client'

// React Imports
import React from 'react'

// MUI Imports
import { Card, CardHeader, CardContent, Box, CircularProgress, Button, Alert } from '@mui/material'

import { useViewStatisticsController } from '../../hooks/useViewStatisticsController'
import ViewStatFilters from './view-statistics/ViewStatFilters'
import ViewStatSummary from './view-statistics/ViewStatSummary'
import ViewStatTable from './view-statistics/ViewStatTable'

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
  const {
    tabValue,
    searchQuery,
    page,
    rowsPerPage,
    currentData,
    loading,
    error,
    totalItems,
    totalViews,
    topContentName,
    handleTabChange,
    handleSearchChange,
    handleChangePage,
    handleChangeRowsPerPage,
    handleItemClick,
    handleExport
  } = useViewStatisticsController({
    exportToExcel
  })

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

        <ViewStatFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          tabValue={tabValue}
          onTabChange={handleTabChange}
        />

        <ViewStatSummary
          totalViews={totalViews}
          topContentName={topContentName}
          totalItems={totalItems}
          currentDataLength={currentData?.length || 0}
        />

        {loading ? (
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
            <CircularProgress />
          </Box>
        ) : (
          <TabPanel value={tabValue} index={0}>
            <ViewStatTable
              tabValue={tabValue}
              currentData={currentData || []}
              totalItems={totalItems}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onItemClick={handleItemClick}
            />
          </TabPanel>
        )}

        {loading ? null : (
          <TabPanel value={tabValue} index={1}>
            <ViewStatTable
              tabValue={tabValue}
              currentData={currentData || []}
              totalItems={totalItems}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onItemClick={handleItemClick}
            />
          </TabPanel>
        )}

        {loading ? null : (
          <TabPanel value={tabValue} index={2}>
            <ViewStatTable
              tabValue={tabValue}
              currentData={currentData || []}
              totalItems={totalItems}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onItemClick={handleItemClick}
            />
          </TabPanel>
        )}
      </CardContent>
    </Card>
  )
}

export default ViewStatistics
