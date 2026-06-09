/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios'

// Tạo axios instance với config
const instance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi cookies
})

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split('=')

    if (key === name) {
      return decodeURIComponent(valueParts.join('='))
    }
  }

  return null
}

// Request interceptor
instance.interceptors.request.use(
  config => {
    // Note: Tokens are now managed as httpOnly cookies
    // They are automatically sent with withCredentials: true

    const method = config.method?.toUpperCase()
    const isUnsafeMethod = method ? ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) : false

    if (isUnsafeMethod) {
      const csrfToken = getCookieValue('csrf-token')

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
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
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Request Error:', error)
    }

    
return Promise.reject(error)
  }
)

// Singleton refresh promise to prevent race conditions on concurrent 401s
let refreshPromise: Promise<boolean> | null = null

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

      // Dùng singleton promise để tránh gọi refresh nhiều lần song song
      if (!refreshPromise) {
        refreshPromise = axios
          .post('/api/auth/refresh', {}, { withCredentials: true })
          .then(res => res.status === 200)
          .catch(() => false)
          .finally(() => {
            refreshPromise = null
          })
      }

      const refreshed = await refreshPromise

      if (refreshed) {
        return instance(originalRequest)
      }

      // Refresh thất bại - redirect về login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }

      
return Promise.reject(error)
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
