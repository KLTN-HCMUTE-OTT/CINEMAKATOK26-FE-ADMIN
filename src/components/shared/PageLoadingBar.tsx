'use client'

import { useEffect, useState } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { CircularProgress, Backdrop } from '@mui/material'

/**
 * Global page loading indicator
 * Shows a loading spinner when navigating between pages
 */
export default function PageLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Show loading when route changes
    setLoading(true)

    // Hide loading after a short delay (route has changed)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  if (!loading) return null

  return (
    <Backdrop
      open={loading}
      sx={{
        color: '#fff',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      <CircularProgress color='primary' size={60} thickness={4} />
    </Backdrop>
  )
}
