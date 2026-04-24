import { Box, Tab, Tabs, Typography } from '@mui/material'

interface UserMetricTabsProps {
  tabValue: number
  onTabChange: (_event: React.SyntheticEvent, newValue: number) => void
}

const UserMetricTabs = ({ tabValue, onTabChange }: UserMetricTabsProps) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
        User Activity Metrics
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={onTabChange} aria-label='user metrics tabs'>
          <Tab label='DAU (Daily Active Users)' id='user-tab-0' aria-controls='user-tabpanel-0' />
          <Tab label='MAU (Monthly Active Users)' id='user-tab-1' aria-controls='user-tabpanel-1' />
          <Tab label='Churn Rate' id='user-tab-2' aria-controls='user-tabpanel-2' />
        </Tabs>
      </Box>
    </Box>
  )
}

export default UserMetricTabs
