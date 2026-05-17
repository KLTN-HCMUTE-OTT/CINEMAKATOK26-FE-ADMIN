import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import KPICard from './KPICard'

describe('KPICard', () => {
  const baseProps = {
    title: 'Total Users',
    value: '152,845',
    icon: 'ri-group-line'
  }

  it('renders title and value', () => {
    render(<KPICard {...baseProps} />)

    expect(screen.getByText('152,845')).toBeInTheDocument()
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('renders numeric value', () => {
    render(<KPICard {...baseProps} value={12345} />)

    expect(screen.getByText('12345')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<KPICard {...baseProps} subtitle="Active subscribers" />)

    expect(screen.getByText('Active subscribers')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<KPICard {...baseProps} />)

    expect(screen.queryByText('Active subscribers')).not.toBeInTheDocument()
  })

  it('renders change indicator with value and comparison text', () => {
    render(<KPICard {...baseProps} change={{ value: '+12.5%', trend: 'up' }} />)

    expect(screen.getByText('+12.5%')).toBeInTheDocument()
    expect(screen.getByText('vs last period')).toBeInTheDocument()
  })

  it('renders negative change', () => {
    render(<KPICard {...baseProps} change={{ value: '-3.2%', trend: 'down' }} />)

    expect(screen.getByText('-3.2%')).toBeInTheDocument()
  })

  it('does not render change section when not provided', () => {
    render(<KPICard {...baseProps} />)

    expect(screen.queryByText('vs last period')).not.toBeInTheDocument()
  })

  it('renders the icon element with correct class', () => {
    const { container } = render(<KPICard {...baseProps} />)

    const icon = container.querySelector('.ri-group-line')
    expect(icon).toBeInTheDocument()
  })

  it('renders up trend icon when trend is up', () => {
    const { container } = render(<KPICard {...baseProps} change={{ value: '+5%', trend: 'up' }} />)

    expect(container.querySelector('.ri-arrow-up-line')).toBeInTheDocument()
  })

  it('renders down trend icon when trend is down', () => {
    const { container } = render(<KPICard {...baseProps} change={{ value: '-5%', trend: 'down' }} />)

    expect(container.querySelector('.ri-arrow-down-line')).toBeInTheDocument()
  })
})
