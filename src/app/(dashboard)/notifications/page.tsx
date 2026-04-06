'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import NotificationsTabs from '@components/molecules/NotificationsTabs'
import NotificationsList from '@components/organisms/NotificationsList'
import NotificationTemplate from '@components/organisms/NotificationTemplate'
import SendNotificationModal from '@components/organisms/SendNotificationModal'

// Mock data
const mockNotifications = [
  {
    id: 1,
    title: 'New Episode Available',
    message: 'Episode 5 of "Stranger Things" is now available to watch!',
    type: 'content_update',
    channels: ['push', 'email'],
    targetAudience: 'Premium Subscribers',
    sentCount: 45623,
    openRate: 78.5,
    clickRate: 12.3,
    status: 'sent',
    scheduledDate: '2024-03-15T10:00:00Z',
    sentDate: '2024-03-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Subscription Renewal Reminder',
    message: 'Your subscription expires in 3 days. Renew now to continue watching!',
    type: 'billing',
    channels: ['email', 'in_app'],
    targetAudience: 'Expiring Subscriptions',
    sentCount: 1256,
    openRate: 85.2,
    clickRate: 34.7,
    status: 'sent',
    scheduledDate: '2024-03-14T09:00:00Z',
    sentDate: '2024-03-14T09:00:00Z'
  },
  {
    id: 3,
    title: 'Weekend Movie Marathon',
    message: 'Join our weekend movie marathon with the best action movies!',
    type: 'promotion',
    channels: ['push', 'email', 'sms'],
    targetAudience: 'All Active Users',
    sentCount: 0,
    openRate: 0,
    clickRate: 0,
    status: 'scheduled',
    scheduledDate: '2024-03-16T18:00:00Z',
    sentDate: null
  }
]

const mockTemplates = [
  {
    id: 1,
    name: 'New Content Release',
    subject: 'New {{content_type}} Available: {{title}}',
    body: 'Hey {{user_name}}, {{title}} is now available on our platform! Watch it now.',
    type: 'content_update',
    variables: ['content_type', 'title', 'user_name'],
    status: 'active'
  },
  {
    id: 2,
    name: 'Subscription Expiry',
    subject: 'Your subscription expires soon',
    body: 'Hi {{user_name}}, your {{plan_name}} subscription expires on {{expiry_date}}.',
    type: 'billing',
    variables: ['user_name', 'plan_name', 'expiry_date'],
    status: 'active'
  }
]

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [templates, setTemplates] = useState(mockTemplates)
  const [sendModalOpen, setSendModalOpen] = useState(false)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSendNotification = (notificationData: any) => {
    const id = Math.max(...notifications.map(n => n.id)) + 1

    const newNotification = {
      id,
      ...notificationData,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      status: notificationData.scheduledDate > new Date().toISOString() ? 'scheduled' : 'sent',
      sentDate: notificationData.scheduledDate <= new Date().toISOString() ? new Date().toISOString() : null
    }

    setNotifications(prev => [newNotification, ...prev])
    setSendModalOpen(false)
  }

  const tabs = [
    {
      label: 'Sent Notifications',
      content: (
        <NotificationsList
          notifications={notifications}
          onEdit={(notification: any) => console.log('Edit notification:', notification)}
          onDelete={(id: number) => setNotifications(prev => prev.filter(n => n.id !== id))}
          onSend={() => setSendModalOpen(true)}
        />
      )
    },
    {
      label: 'Templates',
      content: (
        <NotificationTemplate
          templates={templates}
          onEdit={(template: any) => console.log('Edit template:', template)}
          onDelete={(id: number) => setTemplates(prev => prev.filter(t => t.id !== id))}
          onAdd={() => console.log('Add template')}
        />
      )
    }
  ]

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Notification Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Send targeted notifications and manage communication templates
        </Typography>
      </Box>

      {/* Notifications Tabs */}
      <NotificationsTabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />

      {/* Send Notification Modal */}
      <SendNotificationModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSend={handleSendNotification}
        templates={templates}
      />
    </Box>
  )
}

export default NotificationsPage
