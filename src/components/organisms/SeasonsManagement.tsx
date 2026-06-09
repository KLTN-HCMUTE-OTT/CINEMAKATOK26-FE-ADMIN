'use client'

// MUI Imports
import { Box } from '@mui/material'

// Components Imports
import SeasonStats from '@/components/molecules/SeasonStats'
import SeasonEmptyState from '@/components/molecules/SeasonEmptyState'
import SeasonTable from '@/components/organisms/SeasonTable'
import SeasonModal from '@/components/organisms/SeasonModal'
import { SeasonProvider, useSeason } from '@/features/content/tvseries/contexts/SeasonContext'

interface SeasonsManagementProps {
  titleId: number
  titleType: string
}

const SeasonsManagementContent = () => {
  const { seasons } = useSeason()

  return (
    <Box>
      <SeasonStats seasons={seasons} />
      <SeasonTable />
      <SeasonModal />
    </Box>
  )
}

const SeasonsManagement = ({ titleType }: SeasonsManagementProps) => {
  // Show message if not a series
  if (titleType !== 'Series') {
    return <SeasonEmptyState titleType={titleType} />
  }

  return (
    <SeasonProvider>
      <SeasonsManagementContent />
    </SeasonProvider>
  )
}

export default SeasonsManagement
