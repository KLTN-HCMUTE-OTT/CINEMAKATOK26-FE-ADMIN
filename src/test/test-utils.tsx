import type { ReactElement } from 'react';
import React from 'react'

import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react'
import { SWRConfig } from 'swr'

/**
 * SWR provider that disables caching between tests
 */
function SWRTestProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map()
      }}
    >
      {children}
    </SWRConfig>
  )
}

/**
 * All providers composed for testing
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <SWRTestProvider>{children}</SWRTestProvider>
}

/**
 * Custom render that wraps components with providers
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { customRender as render }
