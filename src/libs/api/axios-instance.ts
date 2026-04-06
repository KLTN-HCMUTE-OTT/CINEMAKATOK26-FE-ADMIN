/**
 * Axios Instance Configuration
 * Central configuration for all API requests
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Log request
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response
    console.log(`API Response from ${response.config.url}:`, response.data)
    return response
  },
  (error: AxiosError) => {
    // Handle errors
    console.error('API error:', error)

    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response
      const errorData = data as any

      // Create custom error
      const customError = new Error(
        Array.isArray(errorData?.message) ? errorData.message[0] : errorData?.message || 'An error occurred'
      ) as Error & { code?: string; statusCode?: number }

      customError.code = errorData?.code
      customError.statusCode = status

      return Promise.reject(customError)
    } else if (error.request) {
      // Request made but no response
      const networkError = new Error(
        'Cannot connect to the server. Please check your internet connection or try again later.'
      )
      return Promise.reject(networkError)
    } else {
      // Something else happened
      return Promise.reject(error)
    }
  }
)

export default axiosInstance

// Helper function to get access token
export function getAuthHeader(): { Authorization: string } | {} {
  if (typeof window === 'undefined') return {}
  const accessToken = localStorage.getItem('accessToken')
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}
