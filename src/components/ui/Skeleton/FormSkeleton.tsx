'use client'

import { Stack, Skeleton, Box } from '@mui/material'

interface FormSkeletonProps {
  fields?: number
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <Stack spacing={3}>
      {/* Title area */}
      <Skeleton variant='text' width='30%' height={32} />

      {/* Form fields */}
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant='text' width={120} height={20} sx={{ mb: 0.5 }} />
          <Skeleton variant='rectangular' height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
        <Skeleton variant='rectangular' width={120} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant='rectangular' width={100} height={40} sx={{ borderRadius: 1 }} />
      </Box>
    </Stack>
  )
}
