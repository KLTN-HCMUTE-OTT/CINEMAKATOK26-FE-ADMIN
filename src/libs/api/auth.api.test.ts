import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./axios-instance', () => ({
  default: {
    request: vi.fn()
  }
}))

import { authApi } from './auth.api'
import axiosInstance from './axios-instance'

const mockedAxios = vi.mocked(axiosInstance)

describe('authApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('login', () => {
    it('posts credentials and returns user data with tokens', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: {
            id: 'user-1',
            name: 'Admin',
            avatar: null,
            isAdmin: true,
            token: { accessToken: 'at-123', refreshToken: 'rt-456' }
          }
        }
      }
      mockedAxios.request.mockResolvedValue(mockResponse)

      // Act
      const result = await authApi.login({ email: 'admin@test.com', password: 'pass123' })

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith({
        url: '/api/v1/auth/login',
        method: 'POST',
        data: { email: 'admin@test.com', password: 'pass123' }
      })
      expect(result.id).toBe('user-1')
      expect(result.isAdmin).toBe(true)
      expect(result.token.accessToken).toBe('at-123')
    })

    it('maps INVALID_PASSWORD error code to user-friendly message', async () => {
      // Arrange
      const apiError = new Error('Original') as any
      apiError.code = 'INVALID_PASSWORD'
      mockedAxios.request.mockRejectedValue(apiError)

      // Act & Assert
      await expect(authApi.login({ email: 'x', password: 'y' })).rejects.toThrow(
        'Email or password is incorrect.'
      )
    })

    it('maps USER_NOT_FOUND error code', async () => {
      const apiError = new Error('') as any
      apiError.code = 'USER_NOT_FOUND'
      mockedAxios.request.mockRejectedValue(apiError)

      await expect(authApi.login({ email: 'x', password: 'y' })).rejects.toThrow(
        'Email or password is incorrect.'
      )
    })

    it('maps ACCOUNT_DEACTIVATED error code', async () => {
      const apiError = new Error('') as any
      apiError.code = 'ACCOUNT_DEACTIVATED'
      mockedAxios.request.mockRejectedValue(apiError)

      await expect(authApi.login({ email: 'x', password: 'y' })).rejects.toThrow(
        'Account has been deactivated.'
      )
    })

    it('passes through unknown errors unchanged', async () => {
      const apiError = new Error('Network timeout')
      mockedAxios.request.mockRejectedValue(apiError)

      await expect(authApi.login({ email: 'x', password: 'y' })).rejects.toThrow('Network timeout')
    })
  })

  describe('refreshToken', () => {
    it('posts refresh token and returns new token pair', async () => {
      // Arrange
      mockedAxios.request.mockResolvedValue({
        data: { data: { accessToken: 'new-at', refreshToken: 'new-rt' } }
      })

      // Act
      const result = await authApi.refreshToken('old-rt')

      // Assert
      expect(result.accessToken).toBe('new-at')
      expect(result.refreshToken).toBe('new-rt')
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/auth/refresh',
          method: 'POST',
          data: { refreshToken: 'old-rt' }
        })
      )
    })
  })

  describe('logout', () => {
    it('posts refresh token to logout endpoint', async () => {
      mockedAxios.request.mockResolvedValue({ data: {} })

      await authApi.logout('rt-token')

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/auth/logout',
          method: 'POST',
          data: { refreshToken: 'rt-token' }
        })
      )
    })
  })

  describe('forgotPassword', () => {
    it('returns OTP expiry minutes on success', async () => {
      mockedAxios.request.mockResolvedValue({
        data: { data: { otpExpiryMinutes: 5 } }
      })

      const result = await authApi.forgotPassword({ email: 'user@test.com' })

      expect(result.otpExpiryMinutes).toBe(5)
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/auth/forgot-password',
          data: { email: 'user@test.com' }
        })
      )
    })

    it('maps OTP_REQUEST_LIMIT_EXCEEDED error', async () => {
      const apiError = new Error('') as any
      apiError.code = 'OTP_REQUEST_LIMIT_EXCEEDED'
      mockedAxios.request.mockRejectedValue(apiError)

      await expect(authApi.forgotPassword({ email: 'x@y.com' })).rejects.toThrow(
        'You have requested OTP too many times'
      )
    })
  })

  describe('resetPassword', () => {
    it('posts reset data without returning value', async () => {
      mockedAxios.request.mockResolvedValue({ data: {} })

      await authApi.resetPassword({
        email: 'user@test.com',
        otp: '123456',
        newPassword: 'NewPass@123'
      })

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/auth/reset-password',
          method: 'POST',
          data: { email: 'user@test.com', otp: '123456', newPassword: 'NewPass@123' }
        })
      )
    })

    it('maps INVALID_OTP error', async () => {
      const apiError = new Error('') as any
      apiError.code = 'INVALID_OTP'
      mockedAxios.request.mockRejectedValue(apiError)

      await expect(
        authApi.resetPassword({ email: 'x', otp: '000', newPassword: 'p' })
      ).rejects.toThrow('Invalid OTP.')
    })

    it('maps OTP_EXPIRED error', async () => {
      const apiError = new Error('') as any
      apiError.code = 'OTP_EXPIRED'
      mockedAxios.request.mockRejectedValue(apiError)

      await expect(
        authApi.resetPassword({ email: 'x', otp: '000', newPassword: 'p' })
      ).rejects.toThrow('OTP has expired.')
    })
  })

  describe('resendOtp', () => {
    it('encodes email in URL parameter', async () => {
      mockedAxios.request.mockResolvedValue({
        data: { data: { otpExpiryMinutes: 5 } }
      })

      await authApi.resendOtp('user+tag@example.com')

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/auth/resend-otp?email=user%2Btag%40example.com',
          method: 'POST'
        })
      )
    })
  })
})
