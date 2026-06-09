'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material'

// Components Imports
import type { ApexOptions } from 'apexcharts'

import KPICard from '@components/shared/KPICard'

// Third-party Imports

// Styled Component Imports
import AppReactApexCharts from '@/libs/styles/AppReactApexCharts'

// Mock data for analytics
const dailyActiveUsersData = {
  series: [{
    name: 'Daily Active Users',
    data: [45000, 52000, 48000, 61000, 55000, 67000, 63000, 58000, 72000, 69000, 75000, 78000, 82000, 79000, 85000]
  }],
  categories: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14', 'Jan 15']
}

const topWatchedTitlesData = {
  series: [{
    name: 'Hours Watched',
    data: [125000, 98000, 87000, 76000, 65000, 54000, 43000, 32000]
  }],
  categories: ['Stranger Things', 'The Matrix', 'Breaking Bad', 'Inception', 'Avatar', 'Interstellar', 'The Godfather', 'Pulp Fiction']
}

const subscriptionDistributionData = {
  series: [45, 35, 20],
  labels: ['Premium', 'Basic', 'Free']
}

const revenueData = {
  series: [{
    name: 'Revenue',
    data: [180000, 195000, 210000, 225000, 240000, 235000, 250000, 265000, 280000, 275000, 290000, 305000]
  }],
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d')

  // Chart options
  const dailyActiveUsersOptions: ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#7367F0'],
    xaxis: {
      categories: dailyActiveUsersData.categories
    },
    yaxis: {
      labels: {
        formatter: (value) => `${(value / 1000).toFixed(0)}K`
      }
    },
    grid: {
      borderColor: '#f1f1f1'
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString()} users`
      }
    }
  }

  const topWatchedOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4
      }
    },
    colors: ['#00CFE8'],
    xaxis: {
      categories: topWatchedTitlesData.categories,
      labels: {
        formatter: (value) => `${(parseInt(value) / 1000).toFixed(0)}K hrs`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toLocaleString()} hours`
      }
    }
  }

  const subscriptionDistributionOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 300
    },
    colors: ['#7367F0', '#00CFE8', '#FDB528'],
    labels: subscriptionDistributionData.labels,
    legend: {
      position: 'bottom'
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}%`
      }
    }
  }

  const revenueOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    colors: ['#28C76F'],
    xaxis: {
      categories: revenueData.categories
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${(value / 1000).toFixed(0)}K`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed insights into your streaming platform performance
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 3 months</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={6}>
        {/* KPI Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Daily Active Users"
            value="85,234"
            change={{ value: "+12.5%", trend: "up" }}
            icon="ri-user-line"
            iconColor="primary"
            subtitle="vs yesterday"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Content Views"
            value="1.2M"
            change={{ value: "+8.7%", trend: "up" }}
            icon="ri-play-circle-line"
            iconColor="success"
            subtitle="total views today"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Session Time"
            value="42m"
            change={{ value: "-2.3%", trend: "down" }}
            icon="ri-time-line"
            iconColor="warning"
            subtitle="per user session"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Conversion Rate"
            value="3.2%"
            change={{ value: "+0.8%", trend: "up" }}
            icon="ri-arrow-up-circle-line"
            iconColor="info"
            subtitle="free to paid"
          />
        </Grid>

        {/* Daily Active Users Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Daily Active Users"
              subheader="User engagement over time"
            />
            <Divider />
            <CardContent>
              <AppReactApexCharts
                type="line"
                height={300}
                options={dailyActiveUsersOptions}
                series={dailyActiveUsersData.series}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Subscription Distribution Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader
              title="Subscription Plans"
              subheader="Distribution of active subscriptions"
            />
            <Divider />
            <CardContent>
              <AppReactApexCharts
                type="pie"
                height={300}
                options={subscriptionDistributionOptions}
                series={subscriptionDistributionData.series}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Top Watched Titles Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="Top Watched Titles"
              subheader="Most popular content by watch hours"
            />
            <Divider />
            <CardContent>
              <AppReactApexCharts
                type="bar"
                height={300}
                options={topWatchedOptions}
                series={topWatchedTitlesData.series}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader
              title="Monthly Revenue"
              subheader="Revenue trend over the year"
            />
            <Divider />
            <CardContent>
              <AppReactApexCharts
                type="area"
                height={300}
                options={revenueOptions}
                series={revenueData.series}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Analytics Cards */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Top Performing Regions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { region: 'North America', users: '45,234', percentage: 42 },
                  { region: 'Europe', users: '32,158', percentage: 30 },
                  { region: 'Asia Pacific', users: '21,467', percentage: 20 },
                  { region: 'Latin America', users: '8,642', percentage: 8 }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1">{item.region}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.users} users</Typography>
                    </Box>
                    <Typography variant="body2" color="primary">{item.percentage}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Device Usage</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { device: 'Smart TV', percentage: 45, color: '#7367F0' },
                  { device: 'Mobile', percentage: 32, color: '#00CFE8' },
                  { device: 'Desktop', percentage: 15, color: '#FDB528' },
                  { device: 'Tablet', percentage: 8, color: '#28C76F' }
                ].map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.device}</Typography>
                      <Typography variant="body2">{item.percentage}%</Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        height: 6, 
                        backgroundColor: '#f1f1f1', 
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: '100%', 
                          width: `${item.percentage}%`, 
                          backgroundColor: item.color 
                        }} 
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AnalyticsPage
