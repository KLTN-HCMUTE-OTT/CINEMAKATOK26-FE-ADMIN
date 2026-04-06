'use client'

// MUI Imports
import { Grid, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'

// Utils Imports
import { formatNumber } from '@/utils/formatNumber'

interface SubscriptionPlansGridProps {
  plans: any[]
}

const SubscriptionPlansGrid = ({ plans }: SubscriptionPlansGridProps) => {
  const activePlans = plans.filter(plan => plan.status === 'active')

  return (
    <Grid container spacing={3}>
      {activePlans.map(plan => (
        <Grid item xs={12} sm={6} md={3} key={plan.id}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' component='h3' sx={{ mb: 1 }}>
                {plan.name}
              </Typography>
              <Typography variant='h4' color='primary' sx={{ mb: 2 }}>
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
                <Typography component='span' variant='body2' color='text.secondary'>
                  {plan.price > 0 && `/${plan.interval}`}
                </Typography>
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {formatNumber(plan.activeSubscribers)} subscribers
              </Typography>
              <List dense>
                {plan.features.slice(0, 3).map((feature: string, index: number) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 20 }}>
                      <i className='ri-check-line text-sm text-green-600' />
                    </ListItemIcon>
                    <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
                {plan.features.length > 3 && (
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemText
                      primary={`+${plan.features.length - 3} more features`}
                      primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default SubscriptionPlansGrid
