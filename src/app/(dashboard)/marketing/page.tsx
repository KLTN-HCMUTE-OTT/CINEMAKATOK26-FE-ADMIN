'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box, Typography } from '@mui/material'

// Components Imports
import MarketingTabs from '@components/molecules/MarketingTabs'
import PromotionsTable from '@components/organisms/PromotionsTable'
import CampaignsTable from '@components/organisms/CampaignsTable'
import VouchersTable from '@components/organisms/VouchersTable'
import PromotionModal from '@components/organisms/PromotionModal'

// Mock data
const mockPromotions = [
  {
    id: 1,
    name: 'Holiday Special 2024',
    type: 'discount',
    value: 50,
    valueType: 'percentage',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'active',
    usage: 1245,
    maxUsage: 5000,
    targetAudience: 'New Users'
  },
  {
    id: 2,
    name: 'Free Month Trial',
    type: 'free_trial',
    value: 30,
    valueType: 'days',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    usage: 3456,
    maxUsage: null,
    targetAudience: 'All Users'
  }
]

const mockCampaigns = [
  {
    id: 1,
    name: 'Summer Blockbusters',
    type: 'content_promotion',
    budget: 10000,
    spent: 7500,
    impressions: 250000,
    clicks: 12500,
    conversions: 890,
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-08-31'
  }
]

const mockVouchers = [
  {
    id: 1,
    code: 'WELCOME20',
    discount: 20,
    type: 'percentage',
    usage: 456,
    maxUsage: 1000,
    status: 'active',
    expiryDate: '2024-12-31'
  }
]

const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [promotions, setPromotions] = useState(mockPromotions)
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [vouchers, setVouchers] = useState(mockVouchers)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleAddPromotion = (data: any) => {
    const id = Math.max(...promotions.map(p => p.id)) + 1

    setPromotions(prev => [...prev, { id, ...data, usage: 0 }])
  }

  const handleEditPromotion = (promotion: any) => {
    setSelectedItem(promotion)
    setModalOpen(true)
  }

  const handleUpdatePromotion = (data: any) => {
    if (!selectedItem) return
    setPromotions(prev => prev.map(p => (p.id === selectedItem.id ? { ...p, ...data } : p)))
    setSelectedItem(null)
  }

  const tabs = [
    {
      label: 'Promotions',
      content: (
        <PromotionsTable
          promotions={promotions}
          onEdit={handleEditPromotion}
          onDelete={(id: number) => setPromotions(prev => prev.filter(p => p.id !== id))}
          onAdd={() => setModalOpen(true)}
        />
      )
    },
    {
      label: 'Campaigns',
      content: (
        <CampaignsTable
          campaigns={campaigns}
          onEdit={(campaign: any) => console.log('Edit campaign:', campaign)}
          onDelete={(id: number) => setCampaigns(prev => prev.filter(c => c.id !== id))}
          onAdd={() => console.log('Add campaign')}
        />
      )
    },
    {
      label: 'Vouchers',
      content: (
        <VouchersTable
          vouchers={vouchers}
          onEdit={(voucher: any) => console.log('Edit voucher:', voucher)}
          onDelete={(id: number) => setVouchers(prev => prev.filter(v => v.id !== id))}
          onAdd={() => console.log('Add voucher')}
        />
      )
    }
  ]

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ fontWeight: 600, mb: 1 }}>
          Marketing & Promotions
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage promotional campaigns, vouchers, and marketing initiatives
        </Typography>
      </Box>

      {/* Marketing Tabs */}
      <MarketingTabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />

      {/* Promotion Modal */}
      <PromotionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedItem(null)
        }}
        onSave={selectedItem ? handleUpdatePromotion : handleAddPromotion}
        initialData={selectedItem}
        title={selectedItem ? 'Edit Promotion' : 'Add New Promotion'}
      />
    </Box>
  )
}

export default MarketingPage
