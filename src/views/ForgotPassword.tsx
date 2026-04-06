'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { authApi } from '@/libs/api/auth.api'

const ForgotPassword = ({ mode }: { mode: Mode }) => {
  // States
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Reset Password Dialog states
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(5)

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await authApi.forgotPassword({ email })
      setOtpExpiryMinutes(response.otpExpiryMinutes)
      setShowResetDialog(true)
      setSuccess(`OTP sent to ${email}. Please check your inbox.`)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setResetError(null)
    setIsResetting(true)

    try {
      await authApi.resetPassword({ email, otp, newPassword })
      setSuccess('Password reset successful! Redirecting to login...')
      setShowResetDialog(false)

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  const handleResendOtp = async () => {
    setResetError(null)
    setIsResetting(true)

    try {
      const response = await authApi.resendOtp(email)
      setOtpExpiryMinutes(response.otpExpiryMinutes)
      setSuccess('New OTP sent to your email')
    } catch (err: any) {
      setResetError(err.message || 'Failed to resend OTP')
    } finally {
      setIsResetting(false)
    }
  }

  const handleCloseResetDialog = () => {
    setShowResetDialog(false)
    setOtp('')
    setNewPassword('')
    setResetError(null)
  }

  return (
    <>
      <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='p-6 sm:!p-12'>
            <Link href='/' className='flex justify-center items-center mbe-6'>
              <Logo />
            </Link>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <div className='flex flex-col gap-5'>
              <Typography className='mbs-1'>
                Enter your admin email and we&#39;ll send you instructions to reset your password
              </Typography>
              {error && (
                <Alert severity='error' onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity='success' onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}
              <Form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
                <TextField
                  autoFocus
                  fullWidth
                  label='Email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button fullWidth variant='contained' type='submit' disabled={isLoading || !email}>
                  {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Send reset link'}
                </Button>
                <Typography className='flex justify-center items-center' color='primary'>
                  <Link href='/login' className='flex items-center'>
                    <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                    <span>Back to Login</span>
                  </Link>
                </Typography>
              </Form>
            </div>
          </CardContent>
        </Card>
        <Illustrations maskImg={{ src: authBackground }} />
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onClose={handleCloseResetDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Reset Your Password</DialogTitle>
        <DialogContent>
          <Typography className='mbe-4'>
            We've sent a 6-digit verification code to <strong>{email}</strong>. The code will expire in{' '}
            {otpExpiryMinutes} minutes.
          </Typography>
          {resetError && (
            <Alert severity='error' className='mbe-4'>
              {resetError}
            </Alert>
          )}
          <div className='flex flex-col gap-4'>
            <TextField
              autoFocus
              fullWidth
              label='Enter OTP'
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isResetting}
              placeholder='123456'
              inputProps={{ maxLength: 6 }}
            />
            <TextField
              fullWidth
              label='New Password'
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={isResetting}
              helperText='Must be at least 8 characters with uppercase, lowercase, number and special character'
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      edge='end'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      onMouseDown={e => e.preventDefault()}
                      disabled={isResetting}
                    >
                      <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </div>
          <Button fullWidth variant='text' onClick={handleResendOtp} disabled={isResetting} className='mt-4'>
            Didn't receive the code? Resend OTP
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} disabled={isResetting}>
            Cancel
          </Button>
          <Button
            onClick={handleResetPassword}
            variant='contained'
            disabled={isResetting || otp.length !== 6 || !newPassword}
          >
            {isResetting ? <CircularProgress size={24} color='inherit' /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ForgotPassword
