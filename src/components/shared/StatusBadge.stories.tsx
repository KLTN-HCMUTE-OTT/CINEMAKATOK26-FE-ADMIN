import type { Meta, StoryObj } from '@storybook/react'

import StatusBadge from './StatusBadge'

const meta: Meta<typeof StatusBadge> = {
  title: 'Shared/StatusBadge',
  component: StatusBadge,
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'pending', 'uploading', 'transcoding', 'ready', 'error', 'published', 'draft', 'cancelled']
    },
    size: { control: 'radio', options: ['small', 'medium'] },
    variant: { control: 'radio', options: ['filled', 'outlined', 'tonal'] }
  }
}

export default meta

type Story = StoryObj<typeof StatusBadge>

export const Active: Story = { args: { status: 'active' } }

export const Pending: Story = { args: { status: 'pending' } }

export const Error: Story = { args: { status: 'error' } }

export const Published: Story = { args: { status: 'published' } }

export const Draft: Story = { args: { status: 'draft' } }

export const MediumSize: Story = { args: { status: 'active', size: 'medium' } }

export const Outlined: Story = { args: { status: 'active', variant: 'outlined' } }

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <StatusBadge status='active' />
      <StatusBadge status='inactive' />
      <StatusBadge status='pending' />
      <StatusBadge status='uploading' />
      <StatusBadge status='transcoding' />
      <StatusBadge status='ready' />
      <StatusBadge status='error' />
      <StatusBadge status='published' />
      <StatusBadge status='draft' />
      <StatusBadge status='cancelled' />
    </div>
  )
}
