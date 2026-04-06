'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box } from '@mui/material'

// Components Imports
import SeasonStats from '@/components/molecules/SeasonStats'
import SeasonEmptyState from '@/components/molecules/SeasonEmptyState'
import SeasonTable from '@/components/organisms/SeasonTable'
import SeasonModal from '@/components/organisms/SeasonModal'

interface SeasonsManagementProps {
  titleId: number
  titleType: string
}

const SeasonsManagement = ({ titleType }: SeasonsManagementProps) => {
  const [seasons, setSeasons] = useState([
    {
      id: 1,
      seasonNumber: 1,
      title: 'The Beginning',
      episodes: 8,
      totalDuration: '6h 24m',
      releaseDate: '2024-01-15',
      status: 'published',
      description: 'The first season introduces the main characters and sets up the story.',
      stats: { views: 2400000, avgRating: 8.7 },
      poster: '/images/season1.jpg'
    },
    {
      id: 2,
      seasonNumber: 2,
      title: 'The Escalation',
      episodes: 10,
      totalDuration: '8h 12m',
      releaseDate: '2024-06-15',
      status: 'published',
      description: 'The second season deepens the mystery and raises the stakes.',
      stats: { views: 2100000, avgRating: 8.9 },
      poster: '/images/season2.jpg'
    },
    {
      id: 3,
      seasonNumber: 3,
      title: 'The Revelation',
      episodes: 12,
      totalDuration: '0h 0m',
      releaseDate: '2024-12-15',
      status: 'production',
      description: 'The upcoming third season promises to reveal major secrets.',
      stats: { views: 0, avgRating: 0 },
      poster: '/images/season3.jpg'
    }
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<any>(null)

  const handleAddSeason = () => {
    setSelectedSeason(null)
    setModalOpen(true)
  }

  const handleEditSeason = (season: any) => {
    setSelectedSeason(season)
    setModalOpen(true)
  }

  const handleSaveSeason = (seasonData: any) => {
    if (selectedSeason) {
      // Edit existing season
      setSeasons(prev => prev.map(season => (season.id === selectedSeason.id ? { ...season, ...seasonData } : season)))
    } else {
      // Add new season
      const newSeason = {
        id: Math.max(...seasons.map(s => s.id)) + 1,
        seasonNumber: Math.max(...seasons.map(s => s.seasonNumber)) + 1,
        ...seasonData,
        episodes: 0,
        totalDuration: '0h 0m',
        stats: { views: 0, avgRating: 0 }
      }

      setSeasons(prev => [...prev, newSeason])
    }

    setModalOpen(false)
    setSelectedSeason(null)
  }

  const handleDeleteSeason = (id: number) => {
    const season = seasons.find(s => s.id === id)

    if (season && season.episodes > 0) {
      alert('Cannot delete season with episodes. Please remove all episodes first.')

      return
    }

    setSeasons(prev => prev.filter(season => season.id !== id))
  }

  const handleViewSeason = (season: any) => {
    console.log('View season details:', season)
  }

  const handleManageEpisodes = (season: any) => {
    console.log('Manage episodes for season:', season)

    // Navigate to episodes management with season filter
  }

  // Show message if not a series
  if (titleType !== 'Series') {
    return <SeasonEmptyState titleType={titleType} />
  }

  return (
    <Box>
      {/* Season Overview Stats */}
      <SeasonStats seasons={seasons} />

      {/* Seasons Table */}
      <SeasonTable
        seasons={seasons}
        onEdit={handleEditSeason}
        onView={handleViewSeason}
        onDelete={handleDeleteSeason}
        onManageEpisodes={handleManageEpisodes}
        onAdd={handleAddSeason}
      />

      {/* Season Modal */}
      <SeasonModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedSeason(null)
        }}
        onSave={handleSaveSeason}
        season={selectedSeason}
        title={selectedSeason ? 'Edit Season' : 'Add New Season'}
      />
    </Box>
  )
}

export default SeasonsManagement
