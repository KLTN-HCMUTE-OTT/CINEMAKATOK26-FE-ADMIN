'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import SubscriptionPlansGrid from '@components/organisms/SubscriptionPlansGrid'
import SubscriptionPlansTable from '@components/organisms/SubscriptionPlansTable'
import SubscriptionPlanModal from '@components/organisms/SubscriptionPlanModal'

// Mock data for subscription plans
const mockPlans = [
  {
    id: 1,
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    activeSubscribers: 15432,
    features: ['Limited content access', '480p quality', '1 device'],
    status: 'active',
    createdDate: '2024-01-01'
  },
  {
    id: 2,
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    activeSubscribers: 28567,
    features: ['Full content access', '720p quality', '2 devices', 'Download for offline'],
    status: 'active',
    createdDate: '2024-01-01'
  },
  {
    id: 3,
    name: 'Premium',
    price: 15.99,
    currency: 'USD',
    interval: 'month',
    activeSubscribers: 45623,
    features: ['Full content access', '4K quality', '4 devices', 'Download for offline', 'No ads'],
    status: 'active',
    createdDate: '2024-01-01'
  },
  {
    id: 4,
    name: 'Family',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    activeSubscribers: 12890,
    features: ['Full content access', '4K quality', '6 devices', 'Download for offline', 'No ads', 'Family profiles'],
    status: 'draft',
    createdDate: '2024-02-15'
  }
]

const SubscriptionsPage = () => {
  const [plans, setPlans] = useState(mockPlans)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan)
    setEditModalOpen(true)
  }

  const handleViewPlan = (plan: any) => {
    console.log('View plan:', plan)
  }

  const handleDeletePlan = (id: number) => {
    console.log('Delete plan:', id)
  }

  const handleAddPlan = (planData: any) => {
    const id = Math.max(...plans.map(p => p.id)) + 1

    const newPlanData = {
      id,
      ...planData,
      activeSubscribers: 0,
      createdDate: new Date().toISOString().split('T')[0]
    }

    setPlans(prev => [...prev, newPlanData])
    setAddModalOpen(false)
  }

  const handleUpdatePlan = (planData: any) => {
    if (!selectedPlan) return

    setPlans(prev =>
      prev.map(plan =>
        plan.id === selectedPlan.id
          ? {
              ...plan,
              ...planData
            }
          : plan
      )
    )
    setEditModalOpen(false)
    setSelectedPlan(null)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Subscription Management
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage subscription plans and pricing
        </Typography>
      </Box>

      {/* Plan Cards Overview */}
      <Box sx={{ mb: 4 }}>
        <SubscriptionPlansGrid plans={plans} />
      </Box>

      {/* Data Table */}
      <SubscriptionPlansTable
        plans={plans}
        onEdit={handleEditPlan}
        onView={handleViewPlan}
        onDelete={handleDeletePlan}
        onAdd={() => setAddModalOpen(true)}
      />

      {/* Add Plan Modal */}
      <SubscriptionPlanModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddPlan}
        title='Add New Subscription Plan'
      />

      {/* Edit Plan Modal */}
      <SubscriptionPlanModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedPlan(null)
        }}
        onSave={handleUpdatePlan}
        title='Edit Subscription Plan'
        initialData={selectedPlan}
      />
    </Box>
  )
}

export default SubscriptionsPage
