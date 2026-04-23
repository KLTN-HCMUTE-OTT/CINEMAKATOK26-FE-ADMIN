/**
 * Category API Service
 * Handles all category-related API calls for Admin
 */

import { axiosInstance } from '@/libs/request'

// Types
export interface Category {
  id: string
  categoryName: string
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  categoryName: string
}

export interface UpdateCategoryDto {
  id: string
  categoryName: string
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

// Helper function for API calls with authentication using axios
async function apiCall<T>(endpoint: string, method: string, data?: any, params?: any): Promise<ApiResponse<T>> {
  const response = await axiosInstance.request<ApiResponse<T>>({
    url: endpoint,
    method,
    data,
    params
  })

  return response.data
}

// Category API methods
export const categoryService = {
  // Get all categories with pagination
  getAll: async (query?: PaginationQuery): Promise<PaginatedResponse<Category>> => {
    const response = await apiCall<PaginatedResponse<Category>>('/api/v1/categories', 'GET', undefined, query)
    return response as any as PaginatedResponse<Category>
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiCall<Category>(`/api/v1/categories/${id}`, 'GET')
    return response.data
  },

  // Create new category
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiCall<Category>('/api/v1/categories', 'POST', data)
    return response.data
  },

  // Update category
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiCall<Category>(`/api/v1/categories/${id}`, 'PUT', data)
    return response.data
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await apiCall<null>(`/api/v1/categories/${id}`, 'DELETE')
  }
}

// Keep export as categoryApi for backward compatibility
export const categoryApi = categoryService
