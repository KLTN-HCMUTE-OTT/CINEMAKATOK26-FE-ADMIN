import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client'

let socket: Socket | null = null
let currentToken: string | null = null

async function fetchSocketToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/socket-token', { credentials: 'include' })

    if (!res.ok) return null
    const body = await res.json() as { token?: string }

    
return body.token ?? null
  } catch {
    return null
  }
}

export async function getWatchPartySocket(): Promise<Socket> {
  const token = await fetchSocketToken()

  // Reuse existing socket if token unchanged and connected
  if (socket && socket.connected && token === currentToken) {
    return socket
  }

  if (socket) {
    socket.disconnect()
    socket = null
  }

  const wsUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

  socket = io(`${wsUrl}/watch-party`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  currentToken = token

  socket.on('connect_error', async (err: Error) => {
    let isUnauthorized = false

    try {
      const parsed = JSON.parse(err.message) as { code?: string }

      isUnauthorized = parsed?.code === 'UNAUTHORIZED'
    } catch {
      isUnauthorized = err.message === 'UNAUTHORIZED'
    }

    if (isUnauthorized && socket) {
      const refreshed = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })

      if (refreshed.ok) {
        const newToken = await fetchSocketToken()

        if (newToken && socket) {
          currentToken = newToken
          socket.auth = { token: newToken }
          socket.connect()
        }
      }
    }
  })

  return socket
}

export function disconnectWatchPartySocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
    currentToken = null
  }
}
