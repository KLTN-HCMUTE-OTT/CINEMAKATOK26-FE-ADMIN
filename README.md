# 🎬 OTT Streaming Admin Dashboard

A production-grade admin dashboard for Over-The-Top (OTT) streaming platforms built with Next.js 14, TypeScript, and Material-UI.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15.19-blue)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Commercial-red)](LICENSE)

## 🚀 Features

### 📊 **Dashboard & Analytics**

- Real-time performance metrics and KPIs
- Interactive charts and data visualization
- User activity and engagement analytics
- Revenue and subscription tracking

### 🎥 **Content Management**

- Video upload with drag-and-drop interface
- Season and episode management for series
- Category and tag organization
- Content metadata and asset management
- Multi-quality video support with subtitle management

### 👥 **User Management**

- User profiles and subscription management
- Role-based access control (RBAC)
- User activity monitoring and audit trails
- Subscription plan management

### 🔴 **Live Streaming**

- Live stream event management
- Real-time viewer statistics
- Stream scheduling and configuration

### 📈 **Marketing & Promotions**

- Campaign management and tracking
- Voucher and discount code system
- Notification management (email, push, in-app)

### 🛡️ **Security & Monitoring**

- Comprehensive security logging
- Rate limiting and CSRF protection
- Input sanitization and XSS prevention
- Error monitoring and structured logging

### ⚡ **Performance**

- Code splitting and lazy loading
- API caching with SWR
- Bundle optimization and analysis
- Core Web Vitals monitoring

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI Library**: Material-UI (MUI) v5
- **Styling**: Emotion CSS-in-JS + Tailwind CSS
- **State Management**: React Hooks + SWR for server state
- **Charts**: ApexCharts
- **Icons**: Iconify (Remix Icons)

### **Architecture**

- **Design Pattern**: Atomic Design (Atoms → Molecules → Organisms)
- **Error Handling**: Global Error Boundaries + Structured Logging
- **Security**: CSRF Protection, Rate Limiting, Input Sanitization
- **Performance**: Dynamic Imports, Bundle Splitting, Web Vitals Monitoring

### **Development Tools**

- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript Strict Mode
- **Bundle Analysis**: @next/bundle-analyzer

## 📋 Prerequisites

- **Node.js**: >= 18.17.0
- **Package Manager**: pnpm (recommended) or npm
- **Browser**: Modern browsers with ES2020 support

## 🚀 Quick Start

### 1. **Clone and Install**

```bash
# Clone the repository
git clone <repository-url>
cd ott-admin-dashboard

# Install dependencies with pnpm (recommended)
pnpm install

# Or with npm
npm install
```

### 2. **Environment Setup**

```bash
# Copy environment template
cp env.example .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables:**

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="OTT Admin Dashboard"

# Security (Generate secure secrets for production)
CSRF_SECRET=your-csrf-secret-key-here
SESSION_SECRET=your-session-secret-key-here
JWT_SECRET=your-jwt-secret-key-here

# External Services (Optional)
SENTRY_DSN=your-sentry-dsn-for-error-monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 3. **Development**

```bash
# Start development server
pnpm dev

# Or with npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. **Build for Production**

```bash
# Production build
pnpm build:production

# Start production server
pnpm start

# Analyze bundle size
pnpm analyze
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (dashboard)/             # Dashboard layout group
│   │   ├── content/             # Content management pages
│   │   ├── users/               # User management pages
│   │   ├── analytics/           # Analytics pages
│   │   └── settings/            # Settings pages
│   ├── error.tsx                # Global error page
│   └── layout.tsx               # Root layout
├── components/                   # React components (Atomic Design)
│   ├── atoms/                   # Basic UI elements
│   ├── molecules/               # Composed components
│   ├── organisms/               # Complex components
│   ├── error/                   # Error handling components
│   ├── layout/                  # Layout components
│   └── shared/                  # Shared utilities
├── hooks/                       # Custom React hooks
├── utils/                       # Utility functions
│   ├── security.ts              # Security utilities
│   ├── logger.ts                # Structured logging
│   ├── monitoring.ts            # Error & performance monitoring
│   ├── api.ts                   # API utilities & SWR
│   └── dynamicImports.ts        # Code splitting utilities
├── configs/                     # Configuration files
│   └── env.ts                   # Environment configuration
├── middleware.ts                # Next.js middleware (security)
└── types/                       # TypeScript type definitions
```

## 🏗️ Architecture Principles

### **Atomic Design Pattern**

Components are organized using Brad Frost's Atomic Design methodology:

- **Atoms** (`src/components/atoms/`): Basic UI elements (buttons, inputs, badges)
- **Molecules** (`src/components/molecules/`): Simple groups of atoms (form fields, cards)
- **Organisms** (`src/components/organisms/`): Complex components (tables, modals, forms)

### **Security-First Approach**

- Input sanitization prevents XSS attacks
- CSRF protection for state-changing operations
- Rate limiting prevents abuse
- Structured logging for security monitoring
- Environment-based security configuration

### **Performance Optimization**

- Dynamic imports for heavy components
- Bundle splitting by feature and vendor
- SWR for efficient data fetching and caching
- Web Vitals monitoring for real-world performance
- Image optimization and lazy loading

## 📚 API Documentation

### **Data Fetching Patterns**

```typescript
import { useAPI, createResource, updateResource } from '@/utils/api'

// Fetch data with SWR
const { data, error, isLoading } = useAPI<Title[]>('/api/titles')

// Create new resource
const handleCreate = async (titleData: Partial<Title>) => {
  await createResource('/api/titles', titleData, {
    revalidate: ['/api/titles'] // Auto-revalidate related endpoints
  })
}

// Update existing resource
const handleUpdate = async (id: string, updates: Partial<Title>) => {
  await updateResource(`/api/titles/${id}`, updates, {
    revalidate: ['/api/titles', `/api/titles/${id}`]
  })
}
```

### **Security Integration**

```typescript
import { useCSRF, securityFetch } from '@/utils/csrf'

// CSRF protection in components
const { getHeaders } = useCSRF()

// Secure API calls
const response = await securityFetch('/api/sensitive-operation', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### **Error Handling**

```typescript
import { withErrorBoundary } from '@/components/error/ErrorBoundary'
import { logger } from '@/utils/logger'

// Wrap components with error boundaries
export default withErrorBoundary(MyComponent, {
  fallback: <CustomErrorUI />,
  onError: (error, errorInfo) => {
    logger.error('Component error', error, { componentStack: errorInfo.componentStack })
  }
})
```

## 🔧 Development Workflow

### **Code Quality**

```bash
# Linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm type-check

# Formatting
pnpm format
```

### **Performance Analysis**

```bash
# Bundle analysis
pnpm analyze

# Performance testing
pnpm test:performance
```

### **Environment Testing**

```bash
# Development
pnpm dev

# Production preview
pnpm build && pnpm start

# Staging deployment
NODE_ENV=staging pnpm build
```

## 🚀 Deployment

### **Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Environment Variables on Vercel:**

- Set all required environment variables in Vercel dashboard
- Use different values for staging vs production
- Enable security headers in Vercel configuration

### **Docker**

```dockerfile
# Production Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Configuration**

Create environment-specific files:

- `.env.development` - Development settings
- `.env.staging` - Staging environment
- `.env.production` - Production secrets

## 🛡️ Security Considerations

### **Production Checklist**

- [ ] Update all secret keys in environment variables
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS policies
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting for your infrastructure
- [ ] Review and update Content Security Policy
- [ ] Enable security headers
- [ ] Set up regular security audits

### **Monitoring**

- Error tracking with Sentry integration
- Performance monitoring with Web Vitals
- Security event logging
- User activity audit trails

## 🤝 Contributing

### **Development Guidelines**

1. Follow Atomic Design principles
2. Write TypeScript with strict type checking
3. Include error boundaries for new features
4. Add performance monitoring for heavy components
5. Follow security best practices
6. Write self-documenting code with JSDoc

### **Pull Request Process**

1. Create feature branch from `main`
2. Follow naming convention: `feature/description` or `fix/description`
3. Ensure all linting and type checks pass
4. Include performance impact assessment
5. Update documentation as needed

## 📄 License

This project is licensed under a Commercial License. See [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/getting-started/installation/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### **Common Issues**

- **Build errors**: Check TypeScript strict mode compliance
- **Performance issues**: Use bundle analyzer (`pnpm analyze`)
- **Security concerns**: Review middleware and input sanitization
- **Deployment problems**: Verify environment variables

### **Getting Help**

- Review component documentation in `/src/components`
- Check utility functions in `/src/utils`
- Examine configuration in `/src/configs`
- Review error logs for debugging information

---

**Built with ❤️ for modern OTT streaming platforms**
