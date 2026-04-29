import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import SeasonForm from './SeasonForm'

describe('SeasonForm', () => {
  const mockSeason = {
    seasonNumber: 1
  }

  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  it('renders correctly', () => {
    render(<SeasonForm season={mockSeason} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save season/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', () => {
    render(<SeasonForm season={mockSeason} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('calls onSave with seasonNumber when save is clicked', () => {
    render(<SeasonForm season={mockSeason} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByRole('button', { name: /save season/i }))
    expect(mockOnSave).toHaveBeenCalledWith({ seasonNumber: 1 })
  })
})
