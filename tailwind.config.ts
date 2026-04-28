import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  corePlugins: {
    preflight: false
  },
  important: '#__next',
  plugins: [require('tailwindcss-logical'), require('./src/@core/tailwind/plugin')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#3b5bdb',
          600: '#364fc7',
          700: '#3046a5',
          800: '#253784',
          900: '#1a237e'
        },
        status: {
          success: '#2e7d32',
          warning: '#e65100',
          error: '#c62828',
          info: '#0277bd'
        }
      },
      spacing: {
        'page-x': '24px',
        section: '32px'
      },
      borderRadius: {
        card: '12px'
      }
    }
  }
}

export default config
