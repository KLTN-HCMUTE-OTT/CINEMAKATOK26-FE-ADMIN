import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the correct label for "active" status', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders the correct label for "published" status', () => {
    render(<StatusBadge status="published" />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders the correct label for "draft" status', () => {
    render(<StatusBadge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders the correct label for "error" status', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('renders the correct label for "pending" status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders the correct label for "transcoding" status', () => {
    render(<StatusBadge status="transcoding" />)
    expect(screen.getByText('Transcoding')).toBeInTheDocument()
  })

  it('renders the correct label for "cancelled" status', () => {
    render(<StatusBadge status="cancelled" />)
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('renders with small size by default', () => {
    const { container } = render(<StatusBadge status="active" />)
    const chip = container.querySelector('.MuiChip-sizeSmall')
    expect(chip).toBeInTheDocument()
  })

  it('renders with medium size when specified', () => {
    const { container } = render(<StatusBadge status="active" size="medium" />)
    const chip = container.querySelector('.MuiChip-sizeMedium')
    expect(chip).toBeInTheDocument()
  })

  it('falls back to default config for unknown status', () => {
    render(<StatusBadge status={'unknown' as any} />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})
