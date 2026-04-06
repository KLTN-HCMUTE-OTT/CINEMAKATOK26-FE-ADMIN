/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// Tạo axios instance với config
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi cookies
})

// Request interceptor
instance.interceptors.request.use(
  config => {
    // Lấy token từ localStorage (chỉ chạy ở client)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // Nếu data là FormData, xóa Content-Type để axios tự set với boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    // Log request ở development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }

    return config
  },
  error => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
instance.interceptors.response.use(
  response => {
    // Log response ở development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    // Xử lý 401 - Unauthorized (Token hết hạn)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Gọi API refresh token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken })

          const { accessToken } = response.data.data
          localStorage.setItem('accessToken', accessToken)

          // Retry request với token mới
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return instance(originalRequest)
        }
      } catch (refreshError) {
        // Refresh token failed - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    // Xử lý 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('❌ Forbidden - No permission')
      if (typeof window !== 'undefined') {
        // Có thể redirect hoặc show toast
        // window.location.href = '/forbidden';
      }
    }

    // Xử lý 404 - Not Found
    if (error.response?.status === 404) {
      console.error('❌ Not Found:', error.config?.url)
    }

    // Xử lý 500 - Internal Server Error
    if (error.response?.status === 500) {
      console.error('❌ Server Error')
      // Có thể show toast hoặc notification
    }

    // Log lỗi ở development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      })
    }

    return Promise.reject(error)
  }
)

// Export request function theo format của @baolq/api2ts
export default function request<T = any>(
  url: string | AxiosRequestConfig,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  // Hỗ trợ 2 cách gọi:
  // 1. request('/api/movies', { method: 'GET' })
  // 2. request({ url: '/api/movies', method: 'GET' })
  if (typeof url === 'string') {
    return instance.request<T>({ url, ...config })
  }
  return instance.request<T>(url)
}

// Export axios instance để dùng trực tiếp nếu cần
export { instance as axiosInstance }

// Export helper functions
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token)
  }
}

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}
