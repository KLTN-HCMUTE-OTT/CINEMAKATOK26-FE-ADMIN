'use client'

import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

import { Box, Typography, Button, Card, CardContent, Alert, Collapse } from '@mui/material'

import { config } from '@/configs/env'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (config.isDevelopment) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error to monitoring service in production
    if (config.isProduction) {
      this.reportError(error, errorInfo)
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    }

    // Example: Send to monitoring service
    // Sentry.captureException(error, { contexts: { react: errorInfo } })

    console.error('Error report:', errorReport)
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    })
  }

  private toggleDetails = () => {
    this.setState(prev => ({
      showDetails: !prev.showDetails
    }))
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Box
          sx={{
            minHeight: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant='h4' component='h1' gutterBottom sx={{ color: 'error.main', mb: 2 }}>
                Something went wrong
              </Typography>

              <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support
                if the problem persists.
              </Typography>

              <Alert severity='error' sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant='body2'>
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant='contained' color='primary' onClick={this.handleReload}>
                  Reload Page
                </Button>

                <Button variant='outlined' onClick={this.handleReset}>
                  Try Again
                </Button>

                {config.isDevelopment && (
                  <Button variant='text' size='small' onClick={this.toggleDetails}>
                    {this.state.showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                )}
              </Box>

              {/* Development-only error details */}
              {config.isDevelopment && (
                <Collapse in={this.state.showDetails}>
                  <Box sx={{ mt: 3, textAlign: 'left' }}>
                    <Typography variant='h6' gutterBottom>
                      Error Details (Development Only)
                    </Typography>

                    <Card variant='outlined' sx={{ p: 2, backgroundColor: 'grey.50' }}>
                      <Typography variant='subtitle2' gutterBottom>
                        Stack Trace:
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
                        {this.state.error?.stack}
                      </Typography>
                    </Card>

                    {this.state.errorInfo && (
                      <Card variant='outlined' sx={{ p: 2, mt: 2, backgroundColor: 'grey.50' }}>
                        <Typography variant='subtitle2' gutterBottom>
                          Component Stack:
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
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      </Card>
                    )}
                  </Box>
                </Collapse>
              )}
            </CardContent>
          </Card>
        </Box>
      )
    }

    return this.props.children
  }
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default ErrorBoundary
