'use client'

import { Grid, Card, CardContent, Skeleton, Box } from '@mui/material'

interface StatsSkeletonProps {
  count?: number
}

export function StatsSkeleton({ count = 4 }: StatsSkeletonProps) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card sx={{ borderRadius: 'var(--mui-shape-customBorderRadius-lg, 12px)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Skeleton variant='text' width={80} height={18} />
                  <Skeleton variant='text' width={60} height={32} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant='circular' width={44} height={44} />
              </Box>
              <Skeleton variant='text' width='70%' height={16} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
