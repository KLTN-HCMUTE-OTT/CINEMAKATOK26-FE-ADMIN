// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

// Env validation
import { validatePublicEnv } from '@/configs/env'

// Validate environment variables at startup
validatePublicEnv()

export const metadata = {
  title: 'StreamAdmin - OTT Platform Admin Dashboard',
  description:
    'Modern OTT streaming platform admin dashboard built with Next.js 14, TypeScript, and TailwindCSS. Manage content, users, subscriptions, and analytics.'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
    </html>
  )
}

export default RootLayout
