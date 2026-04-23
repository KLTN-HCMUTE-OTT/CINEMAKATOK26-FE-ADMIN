/**
 * Authentication API Service
 * Handles all authentication-related API calls for Admin
 */

import { axiosInstance } from '@/libs/request'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  id: string
  name: string
  avatar: string | null
  isAdmin: boolean
  token: TokenResponse
}

export interface OTPResponse {
  otpExpiryMinutes: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode?: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
  code?: string
}

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_PASSWORD: 'Email or password is incorrect.',
  USER_NOT_FOUND: 'Email or password is incorrect.',
  ACCOUNT_DEACTIVATED: 'Account has been deactivated.',
  INVALID_OTP: 'Invalid OTP.',
  OTP_EXPIRED: 'OTP has expired.',
  OTP_REQUEST_LIMIT_EXCEEDED: 'You have requested OTP too many times. Please try again later.'
}

// Helper function for API calls using axios
async function apiCall<T>(endpoint: string, method: string, data?: any): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>({
      url: endpoint,
      method,
      data
    })

    return response.data
  } catch (error: any) {
    // Check for custom error messages
    if (error.code && ERROR_MESSAGES[error.code]) {
      error.message = ERROR_MESSAGES[error.code]
    }
    throw error
  }
}

// Auth API methods
export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiCall<LoginResponse>('/api/v1/auth/login', 'POST', credentials)
    return response.data
  },

  // Forgot Password - Send OTP
  forgotPassword: async (data: ForgotPasswordRequest): Promise<OTPResponse> => {
    const response = await apiCall<OTPResponse>('/api/v1/auth/forgot-password', 'POST', data)
    return response.data
  },

  // Reset Password with OTP
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiCall<null>('/api/v1/auth/reset-password', 'POST', data)
  },

  // Resend OTP for password reset
  resendOtp: async (email: string): Promise<OTPResponse> => {
    const response = await apiCall<OTPResponse>(`/api/v1/auth/resend-otp?email=${encodeURIComponent(email)}`, 'POST')
    return response.data
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiCall<TokenResponse>('/api/v1/auth/refresh', 'POST', { refreshToken })
    return response.data
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await apiCall<null>('/api/v1/auth/logout', 'POST', { refreshToken })
  }
}

// Keep export as authApi for backward compatibility
export const authApi = authService
