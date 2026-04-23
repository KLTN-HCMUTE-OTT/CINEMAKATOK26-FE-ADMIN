/**
 * Axios Instance Configuration
 * Re-exports from src/libs/request.ts for unified API layer
 */

import { axiosInstance } from '@/libs/request'
import { getAuthToken } from '@/libs/request'

// Helper function to maintain compatibility with existing code
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default axiosInstance
