export function createUser(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: `user-${Math.random().toString(36).slice(2)}`,
    name: 'Test User',
    email: 'test@example.com',
    isBanned: false,
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

export function createMovie(overrides: Record<string, any> = {}) {
  return {
    id: `movie-${Math.random().toString(36).slice(2)}`,
    title: 'Test Movie',
    status: 'published',
    rating: 4.5,
    releaseDate: '2024-01-01',
    ...overrides
  }
}

export function createReview(overrides: Record<string, any> = {}) {
  return {
    id: `review-${Math.random().toString(36).slice(2)}`,
    content: 'Great movie!',
    rating: 5,
    status: 'ACTIVE',
    name: 'Reviewer',
    userId: 'u1',
    type: 'REVIEW' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

export function createPaginatedResponse<T>(items: T[], total?: number) {
  return {
    data: {
      data: items,
      meta: {
        totalItems: total ?? items.length,
        totalPages: Math.ceil((total ?? items.length) / 10),
        page: 1,
        limit: 10
      }
    }
  }
}
