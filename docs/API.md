# 📡 API Documentation

This document describes the API integration patterns and utilities used in the OTT Admin Dashboard.

## 🏗️ Architecture Overview

The application uses a layered API architecture with the following components:

- **SWR**: Data fetching and caching layer
- **Security Layer**: CSRF protection and input sanitization
- **Error Handling**: Structured error reporting and retry logic
- **Performance Monitoring**: Request timing and performance metrics

## 🔧 API Utilities

### **Base Configuration**

```typescript
// src/utils/api.ts
import { apiFetch, useAPI, endpoints } from '@/utils/api'

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const DEFAULT_TIMEOUT = 10000 // 10 seconds
```

### **Security Integration**

All API calls automatically include:

- CSRF token headers
- Input sanitization
- Rate limiting compliance
- Error logging

```typescript
import { securityFetch } from '@/utils/csrf'

// Secure API call with automatic CSRF protection
const response = await securityFetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

## 📚 Data Fetching Patterns

### **1. Basic Data Fetching**

```typescript
import { useAPI } from '@/utils/api'

// Simple data fetching with SWR
function TitlesList() {
  const { data, error, isLoading } = useAPI<Title[]>('/api/titles')

  if (error) return <ErrorComponent error={error} />
  if (isLoading) return <LoadingSpinner />

  return <TitlesTable data={data} />
}
```

### **2. Paginated Data**

```typescript
import { usePaginatedAPI } from '@/utils/api'

function PaginatedUsersList() {
  const [page, setPage] = useState(1)
  const { data, error, isLoading } = usePaginatedAPI<User>(
    '/api/users',
    page,
    10 // limit
  )

  return (
    <div>
      <UserTable users={data?.data || []} />
      <Pagination
        page={page}
        totalPages={data?.pagination.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### **3. Infinite Loading**

```typescript
import { useInfiniteAPI } from '@/utils/api'

function InfiniteContentList() {
  const {
    items,
    error,
    isLoading,
    isReachingEnd,
    setSize
  } = useInfiniteAPI<Content>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.length) return null
      return `/api/content?page=${pageIndex + 1}`
    }
  )

  return (
    <div>
      {items.map(item => <ContentCard key={item.id} content={item} />)}
      {!isReachingEnd && (
        <Button onClick={() => setSize(size => size + 1)}>
          Load More
        </Button>
      )}
    </div>
  )
}
```

## 🔄 Data Mutations

### **1. Create Resource**

```typescript
import { createResource } from '@/utils/api'

const handleCreateTitle = async (titleData: Partial<Title>) => {
  try {
    const newTitle = await createResource<Title>('/api/titles', titleData, {
      revalidate: ['/api/titles'] // Auto-revalidate lists
    })

    showSuccessMessage('Title created successfully')
    return newTitle
  } catch (error) {
    showErrorMessage('Failed to create title')
    throw error
  }
}
```

### **2. Update Resource**

```typescript
import { updateResource } from '@/utils/api'

const handleUpdateTitle = async (id: string, updates: Partial<Title>) => {
  try {
    const updatedTitle = await updateResource<Title>(`/api/titles/${id}`, updates, {
      revalidate: ['/api/titles', `/api/titles/${id}`]
    })

    showSuccessMessage('Title updated successfully')
    return updatedTitle
  } catch (error) {
    showErrorMessage('Failed to update title')
    throw error
  }
}
```

### **3. Delete Resource**

```typescript
import { deleteResource } from '@/utils/api'

const handleDeleteTitle = async (id: string) => {
  try {
    await deleteResource(`/api/titles/${id}`, {
      revalidate: ['/api/titles']
    })

    showSuccessMessage('Title deleted successfully')
  } catch (error) {
    showErrorMessage('Failed to delete title')
    throw error
  }
}
```

## 🎯 API Endpoints

### **Content Management**

```typescript
// Title management
GET    /api/titles                    # List all titles
POST   /api/titles                    # Create new title
GET    /api/titles/:id                # Get title details
PUT    /api/titles/:id                # Update title
DELETE /api/titles/:id                # Delete title

// Season management
GET    /api/titles/:id/seasons        # List seasons for title
POST   /api/titles/:id/seasons        # Create new season
PUT    /api/seasons/:id               # Update season
DELETE /api/seasons/:id               # Delete season

// Episode management
GET    /api/titles/:id/episodes       # List episodes for title
POST   /api/titles/:id/episodes       # Create new episode
PUT    /api/episodes/:id              # Update episode
DELETE /api/episodes/:id              # Delete episode

// Category management
GET    /api/categories                # List all categories
POST   /api/categories                # Create new category
PUT    /api/categories/:id            # Update category
DELETE /api/categories/:id            # Delete category
```

### **User Management**

```typescript
// User management
GET    /api/users                     # List all users
POST   /api/users                     # Create new user
GET    /api/users/:id                 # Get user details
PUT    /api/users/:id                 # Update user
DELETE /api/users/:id                 # Delete user

// Subscription management
GET    /api/subscription-plans        # List subscription plans
POST   /api/subscription-plans        # Create new plan
PUT    /api/subscription-plans/:id    # Update plan
DELETE /api/subscription-plans/:id    # Delete plan
```

### **Analytics & Reporting**

```typescript
// Analytics
GET    /api/analytics/overview        # Dashboard overview stats
GET    /api/analytics/users           # User analytics
GET    /api/analytics/content         # Content performance
GET    /api/analytics/revenue         # Revenue analytics

// Reports
GET    /api/reports/daily             # Daily reports
GET    /api/reports/weekly            # Weekly reports
GET    /api/reports/monthly           # Monthly reports
```

### **System Management**

```typescript
// Logs and monitoring
GET    /api/logs/system               # System logs
GET    /api/logs/security             # Security logs
GET    /api/logs/audit                # Audit trail

// Notifications
GET    /api/notifications             # List notifications
POST   /api/notifications             # Send notification
PUT    /api/notifications/:id         # Update notification
DELETE /api/notifications/:id         # Delete notification
```

## 🔒 Security Considerations

### **Authentication Headers**

```typescript
// Automatic CSRF protection
const { getHeaders } = useCSRF()

const secureRequest = await fetch('/api/protected', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...getHeaders() // Includes CSRF token
  },
  body: JSON.stringify(data)
})
```

### **Input Sanitization**

```typescript
import { SecurityUtils } from '@/utils/security'

// Sanitize user input before API calls
const sanitizedData = {
  title: SecurityUtils.sanitizeText(formData.title),
  description: SecurityUtils.sanitizeHtml(formData.description),
  email: SecurityUtils.sanitizeEmail(formData.email)
}

await createResource('/api/titles', sanitizedData)
```

### **Rate Limiting**

All API endpoints are protected by rate limiting:

- General APIs: 50 requests per minute
- Authentication: 5 requests per minute
- Upload endpoints: 10 requests per 5 minutes

```typescript
// Rate limit headers in responses
{
  'X-RateLimit-Limit': '50',
  'X-RateLimit-Remaining': '45',
  'X-RateLimit-Reset': '2024-03-15T14:30:00Z'
}
```

## 🎯 Error Handling

### **API Error Types**

```typescript
class APIError extends Error {
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

// Common error status codes
400 - Bad Request (validation errors)
401 - Unauthorized (authentication required)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource doesn't exist)
408 - Request Timeout
429 - Too Many Requests (rate limited)
500 - Internal Server Error
```

### **Error Handling Pattern**

```typescript
import { APIError } from '@/utils/api'

try {
  const result = await apiFetch('/api/endpoint')
  return result
} catch (error) {
  if (error instanceof APIError) {
    switch (error.status) {
      case 401:
        // Redirect to login
        router.push('/login')
        break
      case 403:
        showErrorMessage('You do not have permission to perform this action')
        break
      case 429:
        showErrorMessage('Too many requests. Please try again later.')
        break
      default:
        showErrorMessage(error.message)
    }
  } else {
    // Network or other errors
    showErrorMessage('An unexpected error occurred')
  }
}
```

## 📊 Performance Monitoring

### **Request Timing**

```typescript
// Automatic performance tracking
const { trackAPICall } = useAPIPerformance()

const data = await trackAPICall('/api/titles', 'GET', () => apiFetch('/api/titles'))
```

### **Cache Management**

```typescript
import { cache } from '@/utils/api'

// Clear all cache
cache.clear()

// Invalidate specific endpoint
cache.invalidate('/api/titles')

// Update cache without revalidation
cache.set('/api/titles', newData)

// Prefetch data
cache.prefetch('/api/upcoming-content')
```

## 🧪 Testing API Integration

### **Mock Data for Development**

```typescript
// src/mocks/api.ts
export const mockTitles: Title[] = [
  {
    id: 1,
    title: 'Sample Movie',
    type: 'Movie',
    status: 'published',
    releaseDate: '2024-01-15'
    // ... other properties
  }
]

// Use in development
if (process.env.NODE_ENV === 'development') {
  // Mock API responses
  const { data } = useAPI('/api/titles', {
    fallbackData: mockTitles
  })
}
```

### **API Response Validation**

```typescript
import { z } from 'zod'

// Define response schemas
const TitleSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.enum(['Movie', 'Series']),
  status: z.enum(['draft', 'published', 'archived']),
  releaseDate: z.string()
})

// Validate API responses
const validateTitleResponse = (data: unknown): Title => {
  return TitleSchema.parse(data)
}
```

## 🚀 Best Practices

### **1. Error Boundaries**

Wrap API-dependent components with error boundaries:

```typescript
import { withErrorBoundary } from '@/components/error/ErrorBoundary'

export default withErrorBoundary(TitlesPage, {
  fallback: <APIErrorFallback />,
  onError: (error) => {
    logger.error('API component error', error)
  }
})
```

### **2. Loading States**

Always handle loading states for better UX:

```typescript
function ContentList() {
  const { data, error, isLoading } = useAPI<Content[]>('/api/content')

  if (error) return <ErrorState error={error} />
  if (isLoading) return <ContentSkeleton />
  if (!data?.length) return <EmptyState />

  return <ContentGrid content={data} />
}
```

### **3. Optimistic Updates**

Use optimistic updates for better perceived performance:

```typescript
import { mutate } from 'swr'

const handleLikeTitle = async (titleId: string) => {
  // Optimistic update
  mutate(
    '/api/titles',
    (currentData: Title[]) =>
      currentData.map(title => (title.id === titleId ? { ...title, likes: title.likes + 1 } : title)),
    false // Don't revalidate immediately
  )

  try {
    await apiFetch(`/api/titles/${titleId}/like`, { method: 'POST' })
    // Revalidate to sync with server
    mutate('/api/titles')
  } catch (error) {
    // Revert optimistic update on error
    mutate('/api/titles')
    throw error
  }
}
```

### **4. Background Sync**

Keep data fresh with background revalidation:

```typescript
const { data } = useAPI('/api/real-time-stats', {
  refreshInterval: 30000, // Refresh every 30 seconds
  revalidateOnFocus: true,
  revalidateOnReconnect: true
})
```

---

This API documentation provides a comprehensive guide for integrating with the OTT Admin Dashboard backend services. For specific endpoint implementations, refer to your backend API documentation.
