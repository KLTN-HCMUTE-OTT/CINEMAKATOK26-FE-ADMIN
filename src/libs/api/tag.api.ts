/**
 * Tag API Service
 * Handles all tag-related API calls for Admin
 */

import axiosInstance, { getAuthHeader } from './axios-instance'

// Types
export interface Tag {
  id: string
  tagName: string
  createdAt: string
  updatedAt: string
}

export interface CreateTagDto {
  tagName: string
}

export interface UpdateTagDto {
  id: string
  tagName: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sort?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  message?: string
}

type PaginationMeta = {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
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

// Helper function for API calls with authentication using axios
async function apiCall<T>(endpoint: string, method: string, data?: any, params?: any): Promise<ApiResponse<T>> {
  const response = await axiosInstance.request<ApiResponse<T>>({
    url: endpoint,
    method,
    data,
    params,
    headers: {
      ...getAuthHeader()
    }
  })

  return response.data
}

// Tag API methods
export const tagApi = {
  // Get all tags with pagination
  getAll: async (query?: PaginationQuery): Promise<PaginatedResponse<Tag>> => {
    const response = await apiCall<PaginatedResponse<Tag>>('/tags', 'GET', undefined, query)
    // Backend returns { data: PaginatedResponse }
    // apiCall already extracts response.data, so we return it directly
    return response as any as PaginatedResponse<Tag>
  },

  // Get tag by ID
  getById: async (id: string): Promise<Tag> => {
    const response = await apiCall<Tag>(`/tags/${id}`, 'GET')
    return response.data
  },

  // Create new tag
  create: async (data: CreateTagDto): Promise<Tag> => {
    const response = await apiCall<Tag>('/tags', 'POST', data)
    return response.data
  },

  // Update tag
  update: async (id: string, data: UpdateTagDto): Promise<Tag> => {
    const response = await apiCall<Tag>(`/tags/${id}`, 'PUT', data)
    return response.data
  },

  // Delete tag
  delete: async (id: string): Promise<void> => {
    await apiCall<null>(`/tags/${id}`, 'DELETE')
  }
}
