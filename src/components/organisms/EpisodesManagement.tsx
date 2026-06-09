'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { Box } from '@mui/material'

// Components Imports
import EpisodeStats from '@/components/molecules/EpisodeStats'
import EpisodeTable from '@/components/organisms/EpisodeTable'
import EpisodeModal from '@/components/organisms/EpisodeModal'

interface EpisodesManagementProps {
  titleId: number
  titleType: string
}

const EpisodesManagement = ({}: EpisodesManagementProps) => {
  const [episodes, setEpisodes] = useState([
    {
      id: 1,
      episodeNumber: 1,
      title: 'The Vanishing of Will Byers',
      season: 1,
      duration: '47:34',
      status: 'published',
      views: 3200000,
      rating: 8.7,
      likes: 45000,
      dislikes: 2300,
      releaseDate: '2024-01-15',
      description: "A young boy vanishes on his way home from a friend's house, setting off a chain of events.",
      thumbnail: '/images/episode1.jpg',
      videoAssets: ['4K', '1080p', '720p'],
      subtitles: ['English', 'Spanish', 'French']
    },
    {
      id: 2,
      episodeNumber: 2,
      title: 'The Weirdo on Maple Street',
      season: 1,
      duration: '55:51',
      status: 'published',
      views: 2800000,
      rating: 8.9,
      likes: 52000,
      dislikes: 1800,
      releaseDate: '2024-01-15',
      description: 'Lucas, Dustin and Mike try to talk to the girl they found in the woods.',
      thumbnail: '/images/episode2.jpg',
      videoAssets: ['4K', '1080p', '720p'],
      subtitles: ['English', 'Spanish']
    },
    {
      id: 3,
      episodeNumber: 3,
      title: 'Holly, Jolly',
      season: 1,
      duration: '51:15',
      status: 'published',
      views: 2600000,
      rating: 8.5,
      likes: 48000,
      dislikes: 2100,
      releaseDate: '2024-01-22',
      description: "An increasingly concerned Nancy looks for Barb and finds out what Jonathan's been up to.",
      thumbnail: '/images/episode3.jpg',
      videoAssets: ['4K', '1080p'],
      subtitles: ['English']
    },
    {
      id: 4,
      episodeNumber: 1,
      title: 'MADMAX',
      season: 2,
      duration: '48:52',
      status: 'scheduled',
      views: 0,
      rating: 0,
      likes: 0,
      dislikes: 0,
      releaseDate: '2024-06-15',
      description: 'The boys and Hopper try to make sense of what happened to Will.',
      thumbnail: '/images/episode4.jpg',
      videoAssets: [],
      subtitles: []
    }
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null)

  const handleAddEpisode = () => {
    setSelectedEpisode(null)
    setModalOpen(true)
  }

  const handleEditEpisode = (episode: any) => {
    setSelectedEpisode(episode)
    setModalOpen(true)
  }

  const handleSaveEpisode = (episodeData: any) => {
    if (selectedEpisode) {
      // Edit existing episode
      setEpisodes(prev =>
        prev.map(episode => (episode.id === selectedEpisode.id ? { ...episode, ...episodeData } : episode))
      )
    } else {
      // Add new episode
      const newEpisode = {
        id: Math.max(...episodes.map(e => e.id)) + 1,
        episodeNumber: 1, // Will be calculated based on season
        ...episodeData,
        views: 0,
        rating: 0,
        likes: 0,
        dislikes: 0,
        videoAssets: [],
        subtitles: []
      }

      setEpisodes(prev => [...prev, newEpisode])
    }

    setModalOpen(false)
    setSelectedEpisode(null)
  }

  const handleDeleteEpisode = (id: number) => {
    if (confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
      setEpisodes(prev => prev.filter(episode => episode.id !== id))
    }
  }

  const handleViewEpisode = (episode: any) => {
    console.log('Preview episode:', episode)

    // Open video player or preview modal
  }

  const handleManageAssets = (episode: any) => {
    console.log('Manage assets for episode:', episode)

    // Navigate to episode assets management
  }

  return (
    <Box>
      {/* Episodes Overview Stats */}
      <EpisodeStats episodes={episodes} />

      {/* Episodes Table */}
      <EpisodeTable
        episodes={episodes}
        onEdit={handleEditEpisode}
        onView={handleViewEpisode}
        onDelete={handleDeleteEpisode}
        onManageAssets={handleManageAssets}
        onAdd={handleAddEpisode}
      />

      {/* Episode Modal */}
      <EpisodeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedEpisode(null)
        }}
        onSave={handleSaveEpisode}
        episode={selectedEpisode}
        title={selectedEpisode ? 'Edit Episode' : 'Add New Episode'}
      />
    </Box>
  )
}

export default EpisodesManagement
