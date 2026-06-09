import { http, HttpResponse } from 'msw'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.email === 'admin@test.com' && body.password === 'password123') {
      return HttpResponse.json({
        id: 'user-1',
        name: 'Admin User',
        avatar: null,
        isAdmin: true,
        token: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      })
    }

    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      }
    })
  }),

  // Users endpoints
  http.get(`${API_URL}/users`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10

    return HttpResponse.json({
      statusCode: 200,
      data: [
        { id: 'u1', name: 'User One', email: 'user1@test.com', isBanned: false },
        { id: 'u2', name: 'User Two', email: 'user2@test.com', isBanned: false },
        { id: 'u3', name: 'User Three', email: 'user3@test.com', isBanned: true }
      ],
      meta: { page, limit, totalItems: 3, totalPages: 1 }
    })
  }),

  http.get(`${API_URL}/users/:id`, ({ params }) => {
    return HttpResponse.json({
      statusCode: 200,
      data: {
        id: params.id,
        name: 'User Detail',
        email: 'detail@test.com',
        isBanned: false,
        createdAt: '2024-01-01T00:00:00Z'
      }
    })
  }),

  http.patch(`${API_URL}/users/:id/ban`, () => {
    return HttpResponse.json({
      statusCode: 200,
      data: { id: 'u1', isBanned: true }
    })
  }),

  http.patch(`${API_URL}/users/:id/unban`, () => {
    return HttpResponse.json({
      statusCode: 200,
      data: { id: 'u1', isBanned: false }
    })
  }),

  // Audit logs / Recent activity
  http.get(`${API_URL}/audit-logs/recent-activity`, ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit')) || 10
    const page = Number(url.searchParams.get('page')) || 1

    return HttpResponse.json({
      statusCode: 200,
      data: [
        {
          id: 'act-1',
          userName: 'Admin',
          action: 'LOGIN',
          description: 'Admin logged in',
          createdAt: '2024-06-01T10:00:00Z'
        },
        {
          id: 'act-2',
          userName: 'Moderator',
          action: 'BAN_USER',
          description: 'Banned user for spam',
          createdAt: '2024-06-01T09:30:00Z'
        }
      ],
      meta: { page, limit, totalItems: 2, totalPages: 1 }
    })
  }),

  // Movies
  http.get(`${API_URL}/movies`, () => {
    return HttpResponse.json({
      statusCode: 200,
      data: [
        { id: 'm1', title: 'Movie One', status: 'published' },
        { id: 'm2', title: 'Movie Two', status: 'draft' }
      ],
      meta: { page: 1, limit: 10, totalItems: 2, totalPages: 1 }
    })
  }),

  // Analytics
  http.get(`${API_URL}/analytics/overview`, () => {
    return HttpResponse.json({
      statusCode: 200,
      data: {
        totalUsers: 152845,
        activeSubscriptions: 89432,
        totalRevenue: 2400000,
        hoursWatched: 1200000
      }
    })
  })
]
