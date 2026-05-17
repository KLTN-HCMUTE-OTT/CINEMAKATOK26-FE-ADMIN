'use client'

import { TableRow, TableCell, Skeleton } from '@mui/material'

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={`skeleton-col-${colIndex}`}>
              <Skeleton
                variant='rectangular'
                height={52}
                sx={{
                  borderRadius: 1,
                  opacity: Math.max(0.2, 1 - rowIndex * 0.12)
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
