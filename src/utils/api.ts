import useSWR, { mutate } from 'swr'
import type { SWRConfiguration } from 'swr'

import { securityFetch } from './csrf'
import { logger } from './logger'
import { performance } from './monitoring'

/**
 * API configuration and utilities
 */

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const DEFAULT_TIMEOUT = 10000 // 10 seconds

/**
 * Enhanced fetch wrapper with security, logging, and error handling
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  // Start performance measurement
  performance.startMeasurement(`api_${endpoint}`)

  try {
    // Create timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Make request with security wrapper
    const response = await securityFetch(url, {
      ...fetchOptions,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status, endpoint)
    }

    const data = await response.json()

    // Log successful request
    logger.info(`API request completed: ${fetchOptions.method || 'GET'} ${endpoint}`, {
      status: response.status,
      url,
      duration: performance.endMeasurement(`api_${endpoint}`)
    })

    return data
  } catch (error) {
    performance.endMeasurement(`api_${endpoint}`, { status: 'error' })

    if (error instanceof Error) {
      logger.error(`API request failed: ${fetchOptions.method || 'GET'} ${endpoint}`, error, {
        url,
        options: fetchOptions
      })

      // Transform common errors
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, endpoint)
      }

      if (error instanceof APIError) {
        throw error
      }

      throw new APIError(error.message, 500, endpoint)
    }

    throw error
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

/**
 * SWR configuration with caching and error handling
 */
export const swrConfig: SWRConfiguration = {
  // Cache settings
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  dedupingInterval: 2000,

  // Error retry
  errorRetryCount: 3,
  errorRetryInterval: 1000,

  // Custom fetcher
  fetcher: (url: string) => apiFetch(url),

  // Error handling
  onError: (error: APIError, key: string) => {
    logger.error(`SWR error for key: ${key}`, error, {
      endpoint: error.endpoint,
      status: error.status
    })
  },

  // Success handling
  onSuccess: (data: any, key: string) => {
    logger.debug(`SWR success for key: ${key}`, { dataSize: JSON.stringify(data).length })
  }
}

/**
 * Custom hooks for common API patterns
 */

// Generic data fetching hook
export function useAPI<T = any>(endpoint: string | null, options?: SWRConfiguration) {
  return useSWR<T, APIError>(endpoint, endpoint ? url => apiFetch<T>(url) : null, {
    ...swrConfig,
    ...options
  })
}

// Paginated data hook
export function usePaginatedAPI<T = any>(
  endpoint: string | null,
  page: number = 1,
  limit: number = 10,
  options?: SWRConfiguration
) {
  const url = endpoint ? `${endpoint}?page=${page}&limit=${limit}` : null

  return useSWR<
    {
      data: T[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    },
    APIError
  >(url, url ? url => apiFetch(url) : null, {
    ...swrConfig,
    ...options
  })
}

// useInfiniteAPI is not implemented - use useSWRInfinite directly instead
export function useInfiniteAPI<T = any>(
  getKey: (pageIndex: number, previousPageData: any) => string | null,
  options?: SWRConfiguration
) {
  throw new Error(
    'useInfiniteAPI is not implemented. Use useSWRInfinite directly. See: https://swr.vercel.app/docs/pagination'
  )
}

/**
 * API mutation utilities
 */
export async function createResource<T = any>(
  endpoint: string,
  data: any,
  options?: { revalidate?: string[] }
): Promise<T> {
  const result = await apiFetch<T>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  // Revalidate related endpoints
  if (options?.revalidate) {
    options.revalidate.forEach(key => mutate(key))
  }

  return result
}

export async function updateResource<T = any>(
  endpoint: string,
  data: any,
  options?: { revalidate?: string[] }
): Promise<T> {
  const result = await apiFetch<T>(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  // Revalidate related endpoints
  if (options?.revalidate) {
    options.revalidate.forEach(key => mutate(key))
  }

  return result
}

export async function deleteResource(endpoint: string, options?: { revalidate?: string[] }): Promise<void> {
  await apiFetch(endpoint, {
    method: 'DELETE'
  })

  // Revalidate related endpoints
  if (options?.revalidate) {
    options.revalidate.forEach(key => mutate(key))
  }
}

/**
 * Cache management utilities
 */
export const cache = {
  // Clear all cache
  clear: () => mutate(() => true, undefined, { revalidate: false }),

  // Invalidate specific key
  invalidate: (key: string) => mutate(key, undefined, { revalidate: true }),

  // Update cache without revalidation
  set: (key: string, data: any) => mutate(key, data, { revalidate: false }),

  // Prefetch data
  prefetch: async (key: string) => {
    try {
      await mutate(key, apiFetch(key), { revalidate: false })
    } catch (error) {
      logger.warn(`Failed to prefetch: ${key}`, { error })
    }
  }
}

/**
 * Common API endpoints (type-safe)
 */
export const endpoints = {
  // Content management
  titles: '/titles',
  title: (id: string | number) => `/titles/${id}`,
  seasons: (titleId: string | number) => `/titles/${titleId}/seasons`,
  episodes: (titleId: string | number) => `/titles/${titleId}/episodes`,

  // User management
  users: '/users',
  user: (id: string | number) => `/users/${id}`,

  // Subscriptions
  subscriptions: '/subscriptions',
  plans: '/subscription-plans',

  // Analytics
  analytics: '/analytics',
  reports: '/reports',

  // System
  logs: '/logs',
  audit: '/audit',

  // Upload
  upload: '/upload',

  // Authentication
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    profile: '/api/v1/auth/profile'
  }
} as const
