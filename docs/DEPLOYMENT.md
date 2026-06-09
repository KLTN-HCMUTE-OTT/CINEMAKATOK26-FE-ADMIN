# 🚀 Deployment Guide

This guide covers deployment strategies for the OTT Admin Dashboard across different environments and platforms.

## 📋 Pre-Deployment Checklist

### **Security Review**

- [ ] All environment variables are properly configured
- [ ] Secret keys are generated and unique for each environment
- [ ] HTTPS is enabled in production
- [ ] CORS policies are configured correctly
- [ ] Rate limiting is appropriate for your usage
- [ ] Security headers are enabled
- [ ] Input sanitization is implemented
- [ ] CSRF protection is active

### **Performance Review**

- [ ] Bundle size is optimized (run `npm run analyze`)
- [ ] Images are optimized and using modern formats
- [ ] Code splitting is implemented for heavy components
- [ ] Caching headers are configured
- [ ] Performance monitoring is set up
- [ ] Core Web Vitals targets are met

### **Quality Assurance**

- [ ] All linting issues are resolved
- [ ] TypeScript compilation passes without errors
- [ ] Build process completes successfully
- [ ] Critical user flows are tested
- [ ] Error boundaries are in place
- [ ] Monitoring and logging are configured

## 🌐 Platform-Specific Deployments

### **Vercel (Recommended)**

Vercel provides the best Next.js hosting experience with automatic optimizations.

#### **Setup**

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Connect Repository**

```bash
# Navigate to project directory
cd ott-admin-dashboard

# Login to Vercel
vercel login

# Link project
vercel link
```

3. **Configure Environment Variables**

```bash
# Set environment variables via CLI
vercel env add CSRF_SECRET production
vercel env add SESSION_SECRET production
vercel env add JWT_SECRET production

# Or use Vercel dashboard for better management
```

#### **Deployment**

```bash
# Development preview
vercel

# Production deployment
vercel --prod

# Specific environment
vercel --target staging
```

#### **Vercel Configuration**

Create `vercel.json`:

```json
{
  "version": 2,
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  },
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### **Docker Deployment**

For containerized deployments on any cloud provider.

#### **Dockerfile**

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### **Docker Compose** (with Redis and PostgreSQL)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/ott_admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ott_admin
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### **Build and Deploy**

```bash
# Build image
docker build -t ott-admin-dashboard .

# Run with Docker Compose
docker-compose up -d

# Deploy to cloud
docker tag ott-admin-dashboard your-registry/ott-admin-dashboard:latest
docker push your-registry/ott-admin-dashboard:latest
```

### **AWS Deployment**

#### **AWS Amplify**

1. **Connect Repository**

   - Go to AWS Amplify Console
   - Connect your GitHub/GitLab repository
   - Select branch for automatic deployments

2. **Build Configuration**

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - pnpm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

3. **Environment Variables**
   - Set all required environment variables in Amplify Console
   - Use AWS Secrets Manager for sensitive data

#### **AWS ECS with Fargate**

1. **Create Task Definition**

```json
{
  "family": "ott-admin-dashboard",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "ott-admin",
      "image": "your-registry/ott-admin-dashboard:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ott-admin-dashboard",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### **Google Cloud Platform**

#### **Cloud Run**

1. **Build and Push to Container Registry**

```bash
# Build image
docker build -t gcr.io/PROJECT_ID/ott-admin-dashboard .

# Push to registry
docker push gcr.io/PROJECT_ID/ott-admin-dashboard
```

2. **Deploy to Cloud Run**

```bash
gcloud run deploy ott-admin-dashboard \
  --image gcr.io/PROJECT_ID/ott-admin-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production
```

## 🔧 Environment-Specific Configurations

### **Development**

```bash
# Local development
cp env.development .env.local
npm run dev
```

### **Staging**

```bash
# Deploy to staging
cp env.staging .env.local
npm run build
npm start

# Or with Docker
docker build -t ott-admin-staging .
docker run -p 3000:3000 --env-file env.staging ott-admin-staging
```

### **Production**

```bash
# Production build
cp env.production .env.local
npm run build:production
npm start

# With performance monitoring
ANALYZE=true npm run build
```

## 📊 Monitoring Setup

### **Application Monitoring**

1. **Sentry Integration**

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const { withSentryConfig } = require('@sentry/nextjs')
```

2. **Health Check Endpoint**
   Create `pages/api/health.js`:

```javascript
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION
  })
}
```

### **Infrastructure Monitoring**

1. **Uptime Monitoring**

   - Set up Pingdom, UptimeRobot, or similar
   - Monitor `/api/health` endpoint
   - Alert on downtime or slow response

2. **Performance Monitoring**
   - Enable Core Web Vitals tracking
   - Set up Real User Monitoring (RUM)
   - Monitor bundle size changes

## 🔐 Security Configuration

### **Production Security Checklist**

- [ ] **HTTPS Only**: Ensure all traffic is encrypted
- [ ] **Security Headers**: Implement all recommended headers
- [ ] **Environment Variables**: No secrets in code
- [ ] **Rate Limiting**: Appropriate limits for your scale
- [ ] **Input Validation**: All user inputs are sanitized
- [ ] **CORS Configuration**: Restrict to allowed origins
- [ ] **Session Security**: Secure session management
- [ ] **Dependency Audit**: Regular security updates

### **Security Headers Configuration**

```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
]
```

## 🚨 Rollback Strategy

### **Quick Rollback**

1. **Vercel**

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote DEPLOYMENT_URL --scope=TEAM
```

2. **Docker**

```bash
# Rollback to previous image
docker pull your-registry/ott-admin-dashboard:previous
docker stop current-container
docker run -d --name ott-admin your-registry/ott-admin-dashboard:previous
```

### **Database Migrations**

If your deployment includes database changes:

1. **Always backup before deployment**
2. **Use reversible migrations**
3. **Test rollback procedures**
4. **Coordinate with application deployment**

## 📈 Performance Optimization

### **Production Performance Checklist**

- [ ] **Bundle Analysis**: Optimize bundle size
- [ ] **Image Optimization**: Use WebP/AVIF formats
- [ ] **Caching Strategy**: Implement appropriate cache headers
- [ ] **CDN Configuration**: Serve static assets from CDN
- [ ] **Database Optimization**: Optimize queries and indexes
- [ ] **Memory Management**: Monitor and optimize memory usage

### **Monitoring Performance**

```javascript
// Web Vitals monitoring
export function reportWebVitals(metric) {
  // Send to analytics service
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    event_label: metric.id,
    non_interaction: true
  })
}
```

## 🆘 Troubleshooting

### **Common Issues**

1. **Build Failures**

   - Check TypeScript errors
   - Verify environment variables
   - Review dependencies

2. **Runtime Errors**

   - Check error boundaries
   - Review server logs
   - Verify API endpoints

3. **Performance Issues**
   - Run bundle analysis
   - Check memory usage
   - Review database queries

### **Debug Commands**

```bash
# Check build issues
npm run build 2>&1 | tee build.log

# Analyze bundle
npm run analyze

# Check dependencies
npm audit

# Environment verification
node -e "console.log(process.env)"
```

---

This deployment guide provides comprehensive instructions for deploying the OTT Admin Dashboard to various platforms while maintaining security, performance, and reliability standards.
