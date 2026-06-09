import React from 'react'

import { describe, it, expect, vi, beforeEach } from 'vitest'

import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test/test-utils'

// Mock MUI with lightweight accessible stubs to avoid V8 table size OOM
vi.mock('@mui/material/Card', () => ({
  default: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>
}))
vi.mock('@mui/material/CardContent', () => ({
  default: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))
vi.mock('@mui/material/Typography', () => ({
  default: ({ children, ...props }: any) => <span {...props}>{children}</span>
}))
vi.mock('@mui/material/TextField', () => ({
  default: ({ label, type, value, onChange, InputProps, ...props }: any) => (
    <div>
      <label htmlFor={`field-${label}`}>{label}</label>
      <input
        id={`field-${label}`}
        type={type || 'text'}
        value={value}
        onChange={onChange}
        aria-label={label}
        {...props}
      />
    </div>
  )
}))
vi.mock('@mui/material/IconButton', () => ({
  default: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}))
vi.mock('@mui/material/InputAdornment', () => ({
  default: ({ children }: any) => <span>{children}</span>
}))
vi.mock('@mui/material/Checkbox', () => ({
  default: (props: any) => <input type="checkbox" {...props} />
}))
vi.mock('@mui/material/Button', () => ({
  default: ({ children, onClick, type, disabled, ...props }: any) => (
    <button onClick={onClick} type={type} disabled={disabled} {...props}>{children}</button>
  )
}))
vi.mock('@mui/material/FormControlLabel', () => ({
  default: ({ label, control }: any) => <label>{control}{label}</label>
}))
vi.mock('@mui/material/Alert', () => ({
  default: ({ children, ...props }: any) => <div role="alert" {...props}>{children}</div>
}))
vi.mock('@mui/material/CircularProgress', () => ({
  default: () => <div role="progressbar" />
}))

const mockLogin = vi.fn()
const mockPush = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    isLoading: false
  })
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams()
}))

vi.mock('@core/hooks/useImageVariant', () => ({
  useImageVariant: () => '/images/mock.png'
}))

vi.mock('@configs/themeConfig', () => ({
  default: { templateName: 'CinemaKatok' }
}))

vi.mock('@components/layout/shared/Logo', () => ({ default: () => null }))
vi.mock('@components/Illustrations', () => ({ default: () => null }))

import Login from '@/views/Login'

describe('Login Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('complete successful login flow', async () => {
    // Arrange
    mockLogin.mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<Login mode="light" />)

    // Act
    await user.type(screen.getByLabelText(/email/i), 'admin@cinema.com')
    await user.type(screen.getByLabelText(/password/i), 'Admin@123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Assert
    expect(mockLogin).toHaveBeenCalledWith('admin@cinema.com', 'Admin@123')
  })

  it('displays server error and allows retry', async () => {
    // Arrange
    mockLogin
      .mockRejectedValueOnce(new Error('Server unavailable'))
      .mockResolvedValueOnce(undefined)
    const user = userEvent.setup()

    render(<Login mode="light" />)

    // Act — first attempt fails
    await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
    await user.type(screen.getByLabelText(/password/i), 'pass')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Assert — error shown
    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeInTheDocument()
    })

    // Act — retry succeeds
    await user.click(screen.getByRole('button', { name: /log in/i }))

    // Assert
    expect(mockLogin).toHaveBeenCalledTimes(2)
  })
})
