/**
 * Axios Instance Configuration
 * Re-exports from src/libs/request.ts for unified API layer
 */

import { axiosInstance } from '@/libs/request'

export function getAuthHeader(): { Authorization: string } | {} {
  return {}
}

export default axiosInstance
