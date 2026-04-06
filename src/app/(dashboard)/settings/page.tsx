'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import SettingsTabs from '@components/molecules/SettingsTabs'
import GeneralSettings from '@components/organisms/GeneralSettings'
import PaymentSettings from '@components/organisms/PaymentSettings'
import NotificationSettings from '@components/organisms/NotificationSettings'
import RolesPermissions from '@components/organisms/RolesPermissions'

const SettingsPage = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSaveGeneral = (data: any) => {
    console.log('Saving general settings:', data)
  }

  const handleSavePayments = (data: any) => {
    console.log('Saving payment settings:', data)
  }

  const handleSaveNotifications = (data: any) => {
    console.log('Saving notification settings:', data)
  }

  const handleAddRole = (roleData: { name: string; permissions: string[] }) => {
    console.log('Adding new role:', roleData)
  }

  const handleEditRole = (id: number) => {
    console.log('Editing role:', id)
  }

  const tabs = [
    {
      label: 'General',
      content: <GeneralSettings onSave={handleSaveGeneral} />
    },
    {
      label: 'Payments',
      content: <PaymentSettings onSave={handleSavePayments} />
    },
    {
      label: 'Notifications',
      content: <NotificationSettings onSave={handleSaveNotifications} />
    },
    {
      label: 'Roles & Permissions',
      content: <RolesPermissions onAddRole={handleAddRole} onEditRole={handleEditRole} />
    }
  ]

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Configure your streaming platform settings
        </Typography>
      </Box>

      {/* Settings Tabs */}
      <SettingsTabs activeTab={tabValue} onTabChange={handleTabChange} tabs={tabs} />
    </Box>
  )
}

export default SettingsPage
