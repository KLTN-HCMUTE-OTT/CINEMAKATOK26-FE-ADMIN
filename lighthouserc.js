module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      startServerReadyPattern: /Ready in/i,
      startServerReadyTimeout: 30000,
      url: ['http://localhost:3005', 'http://localhost:3005/users', 'http://localhost:3005/analytics'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --headless'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': 'off', // Not applicable for admin dashboard

        // Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

        // Resource efficiency
        'unused-javascript': ['warn', { maxLength: 3 }],
        'unused-css-rules': ['warn', { maxLength: 3 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'uses-text-compression': ['warn', { maxLength: 0 }],

        // Security
        'is-on-https': 'off', // Development server
        'uses-http2': 'off', // Development server
        'no-vulnerable-libraries': ['error', { maxLength: 0 }],

        // Accessibility
        'color-contrast': ['error', { maxLength: 0 }],
        'heading-order': ['warn', { maxLength: 0 }],
        'link-name': ['error', { maxLength: 0 }],
        'button-name': ['error', { maxLength: 0 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-reports'
      }
    }
  }
}
