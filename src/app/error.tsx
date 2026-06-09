'use client'

import { useEffect } from 'react'

import { Box, Typography, Button, Card, CardContent } from '@mui/material'

import { monitoring } from '@/utils/monitoring'
import { logger } from '@/utils/logger'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error page for Next.js App Router
 * Automatically catches errors in page components
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to our monitoring system
    logger.error('Application error occurred', error, {
      digest: error.digest,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    })

    // Report to monitoring service
    monitoring.captureError(error, {
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      metadata: {
        digest: error.digest,
        timestamp: new Date().toISOString()
      }
    })
  }, [error])

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <html>
      <body>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant='h3' component='h1' gutterBottom sx={{ color: 'error.main', mb: 2 }}>
                Oops! Something went wrong
              </Typography>

              <Typography variant='h6' color='text.secondary' sx={{ mb: 3 }}>
                We encountered an unexpected error. Don&apos;t worry, our team has been notified.
              </Typography>

              <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
                You can try refreshing the page or returning to the homepage. If the problem persists, please contact
                our support team.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant='contained' color='primary' onClick={reset} size='large'>
                  Try Again
                </Button>

                <Button variant='outlined' onClick={handleReload} size='large'>
                  Reload Page
                </Button>

                <Button variant='text' onClick={handleGoHome} size='large'>
                  Go Home
                </Button>
              </Box>

              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Development Error Details:
                  </Typography>
                  <Typography
                    variant='body2'
                    component='pre'
                    sx={{
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 200,
                      fontFamily: 'monospace'
                    }}
                  >
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </body>
    </html>
  )
}
