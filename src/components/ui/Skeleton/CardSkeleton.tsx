'use client'

import { Card, CardContent, Skeleton, Box } from '@mui/material'

interface CardSkeletonProps {
  count?: number
}

export function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ borderRadius: 'var(--mui-shape-customBorderRadius-lg, 12px)' }}>
          <CardContent>
            <Skeleton variant='text' width='40%' height={24} sx={{ mb: 1 }} />
            <Skeleton variant='text' width='60%' height={18} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant='circular' width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant='text' width='80%' height={20} />
                <Skeleton variant='text' width='50%' height={16} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
