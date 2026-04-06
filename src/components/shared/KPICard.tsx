'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import { useTheme } from '@mui/material/styles'

// Types
interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon: string
  iconColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  subtitle?: string
}

const KPICard = ({ title, value, change, icon, iconColor = 'primary', subtitle }: KPICardProps) => {
  const theme = useTheme()

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return theme.palette.success.main
      case 'down':
        return theme.palette.error.main
      default:
        return theme.palette.text.secondary
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'ri-arrow-up-line'
      case 'down':
        return 'ri-arrow-down-line'
      default:
        return 'ri-subtract-line'
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant='h4' component='div' sx={{ fontWeight: 600, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant='caption' color='text.secondary'>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            variant='rounded'
            sx={{
              backgroundColor: `var(--mui-palette-${iconColor}-lightOpacity)`,
              color: `var(--mui-palette-${iconColor}-main)`,
              width: 44,
              height: 44
            }}
          >
            <i className={`${icon} text-xl`} />
          </Avatar>
        </Box>

        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: getTrendColor(change.trend),
                fontSize: '0.875rem'
              }}
            >
              <i className={`${getTrendIcon(change.trend)} mr-1`} />
              {change.value}
            </Box>
            <Typography variant='body2' color='text.secondary'>
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default KPICard
