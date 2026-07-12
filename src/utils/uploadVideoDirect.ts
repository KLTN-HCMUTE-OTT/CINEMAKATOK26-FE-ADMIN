import axios, { type AxiosResponse } from 'axios'

async function getFreshAccessToken(): Promise<string> {
  // Proactively refresh so the access token stays valid for the whole
  // upload instead of expiring mid-transfer (access tokens live 15 min).
  await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }).catch(() => {})

  const res = await fetch('/api/auth/socket-token', { credentials: 'include' })

  if (!res.ok) {
    throw new Error('Not authenticated')
  }

  const { token } = await res.json()

  return token
}

/**
 * Uploads a video file straight to the backend, bypassing the Next.js
 * same-origin proxy (`/api/v1/[...path]`). That proxy runs as a Vercel
 * Serverless Function which buffers the whole request body in memory —
 * Vercel caps that at ~4.5MB, so any real video file gets rejected with
 * 413 before the proxy code even runs.
 */
export async function uploadVideoDirect(
  file: File,
  options?: {
    timeout?: number
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void
  }
): Promise<AxiosResponse<any>> {
  const token = await getFreshAccessToken()
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const formData = new FormData()

  formData.append('file', file)

  return axios.post(`${apiUrl}/api/v1/videos/upload`, formData, {
    timeout: options?.timeout ?? 30 * 60 * 1000,
    onUploadProgress: options?.onUploadProgress,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
