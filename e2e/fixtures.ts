import { test as base, expect, Page } from '@playwright/test'

const TEST_EMAIL = 'admin@test.com'
const TEST_PASSWORD = 'password123'

async function mockApiRoutes(page: Page) {
  // 1. Mock BFF (Next.js server-side route handlers) called by the browser
  await page.route('**/api/auth/login', async route => {
    const postData = route.request().postDataJSON()
    if (postData && (postData.password === 'wrongpassword' || postData.email === 'wrong@example.com')) {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email or password is incorrect.' })
      })
    }

    // Set the cookies dynamically on the browser context
    await page.context().addCookies([
      { name: 'accessToken', value: 'mock-access-token', domain: 'localhost', path: '/' },
      { name: 'refreshToken', value: 'mock-refresh-token', domain: 'localhost', path: '/' },
      { name: 'csrf-token', value: 'mock-csrf-token', domain: 'localhost', path: '/' }
    ])

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'admin-1',
          name: 'Admin User',
          avatar: null,
          isAdmin: true
        }
      })
    })
  })

  await page.route('**/api/auth/logout', async route => {
    await page.context().clearCookies()
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    })
  })

  await page.route('**/api/auth/refresh', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    })
  })

  // 2. Mock all API calls to v1 endpoints (backend gateway calls)
  await page.route('**/api/v1/**', async route => {
    const url = route.request().url()
    const method = route.request().method()

    // Login endpoint (in case any code calls the backend /api/v1 directly)
    if (url.includes('/auth/login') && method === 'POST') {
      const postData = route.request().postDataJSON()
      if (postData && (postData.password === 'wrongpassword' || postData.email === 'wrong@example.com')) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            statusCode: 401,
            message: 'Email or password is incorrect.',
            code: 'USER_NOT_FOUND'
          })
        })
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'admin-1',
            name: 'Admin User',
            avatar: null,
            isAdmin: true,
            token: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token'
            }
          }
        })
      })
    }

    // Refresh token
    if (url.includes('/auth/refresh') && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
          }
        })
      })
    }

    // Users list and management
    if (url.includes('/users') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'u1', name: 'User One', email: 'user1@test.com', isBanned: false, createdAt: '2024-01-01T00:00:00Z' },
            { id: 'u2', name: 'User Two', email: 'user2@test.com', isBanned: false, createdAt: '2024-01-01T00:00:00Z' },
            { id: 'u3', name: 'User Three', email: 'user3@test.com', isBanned: true, createdAt: '2024-01-01T00:00:00Z' }
          ],
          meta: {
            totalItems: 3,
            totalPages: 1
          }
        })
      })
    }

    if (url.includes('/users/') && url.includes('/detail') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'u1',
            name: 'User One',
            email: 'user1@test.com',
            isBanned: false,
            createdAt: '2024-01-01T00:00:00Z'
          }
        })
      })
    }

    if (url.includes('/users/') && url.includes('/ban') && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'u1',
            isBanned: true
          }
        })
      })
    }

    if (url.includes('/users/') && url.includes('/unban') && method === 'DELETE') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'u1',
            isBanned: false
          }
        })
      })
    }

    // Movies list and details
    if (url.includes('/movies') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'm1',
              metaData: {
                title: 'Avatar',
                description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission.',
                type: 'MOVIE',
                releaseDate: '2009-12-18T00:00:00.000Z',
                maturityRating: 'PG-13',
                thumbnail: 'https://example.com/avatar.jpg'
              },
              status: 'published'
            }
          ],
          meta: {
            totalItems: 1,
            totalPages: 1
          }
        })
      })
    }

    if (url.includes('/movies/') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'm1',
            metaData: {
              title: 'Avatar',
              description: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission.',
              type: 'MOVIE',
              releaseDate: '2009-12-18T00:00:00.000Z',
              maturityRating: 'PG-13',
              thumbnail: 'https://example.com/avatar.jpg'
            },
            status: 'published'
          }
        })
      })
    }

    if (url.includes('/movies') && method === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 'm1', metaData: { title: 'Avatar' } }
        })
      })
    }

    if (url.includes('/movies/') && method === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 'm1', metaData: { title: 'Avatar Updated' } }
        })
      })
    }

    if (url.includes('/movies/') && method === 'DELETE') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 200,
          data: null
        })
      })
    }

    // TV series
    if (url.includes('/tv-series') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'tv1',
              totalSeasons: 1,
              metaData: {
                title: 'Breaking Bad',
                description: 'A high school chemistry teacher turns to manufacturing methamphetamine.',
                type: 'TV SHOW',
                releaseDate: '2008-01-20T00:00:00.000Z',
                maturityRating: 'TV-MA',
                thumbnail: 'https://example.com/breaking-bad.jpg'
              },
              seasons: [
                {
                  id: 's1',
                  seasonNumber: 1,
                  episodes: [
                    {
                      id: 'e1',
                      episodeNumber: 1,
                      episodeTitle: 'Pilot',
                      episodeDuration: 3480,
                      video: {
                        status: 'READY'
                      }
                    }
                  ]
                }
              ]
            }
          ],
          meta: {
            totalItems: 1,
            totalPages: 1
          }
        })
      })
    }

    if (url.includes('/tv-series/') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'tv1',
            totalSeasons: 1,
            metaData: {
              title: 'Breaking Bad',
              description: 'A high school chemistry teacher turns to manufacturing methamphetamine.',
              type: 'TV SHOW',
              releaseDate: '2008-01-20T00:00:00.000Z',
              maturityRating: 'TV-MA',
              thumbnail: 'https://example.com/breaking-bad.jpg'
            },
            seasons: [
              {
                id: 's1',
                seasonNumber: 1,
                episodes: [
                  {
                    id: 'e1',
                    episodeNumber: 1,
                    episodeTitle: 'Pilot',
                    episodeDuration: 3480,
                    video: {
                      status: 'READY'
                    }
                  }
                ]
              }
            ]
          }
        })
      })
    }

    if (url.includes('/tv-series') && method === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 'tv1' }
        })
      })
    }

    if (url.includes('/tv-series/') && method === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 'tv1' }
        })
      })
    }

    if (url.includes('/tv-series/') && method === 'DELETE') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 200,
          data: null
        })
      })
    }

    // News
    if (url.includes('/news') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'n1',
              title: 'News Title',
              content: 'News content.',
              status: 'published',
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          meta: {
            totalItems: 1,
            totalPages: 1
          }
        })
      })
    }

    // Categories
    if (url.includes('/categories') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'c1', name: 'Action', slug: 'action' }
          ],
          meta: {
            totalItems: 1,
            totalPages: 1
          }
        })
      })
    }

    // Tags
    if (url.includes('/tags') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 't1', name: 'Sci-Fi', slug: 'sci-fi' }
          ],
          meta: {
            totalItems: 1,
            totalPages: 1
          }
        })
      })
    }

    // Analytics & Audit logs
    if (url.includes('/analytics/users') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            totalUsers: 100,
            activeSubscriptions: 50,
            totalRevenue: 1000,
            hoursWatched: 500
          }
        })
      })
    }

    if (url.includes('/analytics/movies') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [{ id: 'm1', title: 'Avatar', views: 500 }]
          }
        })
      })
    }

    if (url.includes('/analytics/tvseries') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [{ id: 'tv1', title: 'Breaking Bad', views: 600 }]
          }
        })
      })
    }

    if (url.includes('/analytics/categories') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [{ id: 'c1', name: 'Action', views: 700 }]
          }
        })
      })
    }

    if (url.includes('/analytics/trending') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { items: [] }
        })
      })
    }

    if (url.includes('/analytics/forecast') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { items: [] }
        })
      })
    }

    if (url.includes('/audit-logs/recent-activity') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 200,
          data: [
            {
              id: 'act-1',
              userName: 'Admin',
              action: 'LOGIN',
              description: 'Admin logged in',
              createdAt: '2024-06-01T10:00:00Z'
            }
          ],
          meta: {
            totalItems: 1,
            totalPages: 1
          }
        })
      })
    }

    // Default API Fallback
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} })
    })
  })
}

async function loginAs(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/email/i).fill(TEST_EMAIL)
  await page.getByLabel(/password/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /log in/i }).click()
  await page.waitForURL(url => !url.toString().includes('/login'), {
    timeout: 10000
  })
}

export const test = base.extend<{ authenticatedPage: Page }>({
  // Auto-setup route mocks on standard page
  page: async ({ page }, use) => {
    await mockApiRoutes(page)
    await use(page)
  },

  // Authenticated page: Bypasses UI login by directly adding mock cookies
  authenticatedPage: async ({ page }, use) => {
    await mockApiRoutes(page)
    
    // Inject auth cookies directly so we are instantly authenticated
    await page.context().addCookies([
      { name: 'accessToken', value: 'mock-access-token', domain: 'localhost', path: '/' },
      { name: 'refreshToken', value: 'mock-refresh-token', domain: 'localhost', path: '/' },
      { name: 'csrf-token', value: 'mock-csrf-token', domain: 'localhost', path: '/' }
    ])

    // Navigate straight to dashboard root
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await use(page)
  }
})

export { expect }
