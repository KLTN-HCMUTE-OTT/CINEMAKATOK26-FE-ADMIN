import { Box, Tabs, Tab, TextField } from '@mui/material'

interface ViewStatFiltersProps {
  searchQuery: string
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  tabValue: number
  onTabChange: (_event: React.SyntheticEvent, newValue: number) => void
}

const ViewStatFilters = ({ searchQuery, onSearchChange, tabValue, onTabChange }: ViewStatFiltersProps) => {
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search by title or category...'
          value={searchQuery}
          onChange={onSearchChange}
          InputProps={{
            startAdornment: <i className='ri-search-line' style={{ marginRight: 8, color: '#666' }} />
          }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={onTabChange} aria-label='view statistics tabs'>
          <Tab label='Movies' id='viewstats-tab-0' aria-controls='viewstats-tabpanel-0' />
          <Tab label='TV Series' id='viewstats-tab-1' aria-controls='viewstats-tabpanel-1' />
          <Tab label='Categories' id='viewstats-tab-2' aria-controls='viewstats-tabpanel-2' />
        </Tabs>
      </Box>
    </>
  )
}

export default ViewStatFilters
