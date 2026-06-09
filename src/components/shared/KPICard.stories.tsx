import type { Meta, StoryObj } from '@storybook/react'

import KPICard from './KPICard'

const meta: Meta<typeof KPICard> = {
  title: 'Shared/KPICard',
  component: KPICard,
  argTypes: {
    iconColor: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info']
    }
  },
  decorators: [
    Story => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    )
  ]
}

export default meta

type Story = StoryObj<typeof KPICard>

export const Default: Story = {
  args: {
    title: 'Total Users',
    value: '12,450',
    icon: 'ri-user-line',
    iconColor: 'primary'
  }
}

export const WithChange: Story = {
  args: {
    title: 'Revenue',
    value: '$45,200',
    icon: 'ri-money-dollar-circle-line',
    iconColor: 'success',
    change: { value: '+12.5%', trend: 'up' }
  }
}

export const TrendDown: Story = {
  args: {
    title: 'Churn Rate',
    value: '3.2%',
    icon: 'ri-user-unfollow-line',
    iconColor: 'error',
    change: { value: '+0.8%', trend: 'down' }
  }
}

export const WithSubtitle: Story = {
  args: {
    title: 'Active Streams',
    value: '1,234',
    icon: 'ri-live-line',
    iconColor: 'info',
    subtitle: 'Last 24 hours',
    change: { value: '+5%', trend: 'up' }
  }
}
