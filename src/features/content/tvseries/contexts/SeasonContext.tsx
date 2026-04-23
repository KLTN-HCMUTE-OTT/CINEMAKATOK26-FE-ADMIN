'use client'

import { createContext, useContext, useMemo, useState } from 'react'

export interface SeasonItem {
  id: number
  seasonNumber: number
  title: string
  episodes: number
  totalDuration: string
  releaseDate: string
  status: string
  description: string
  stats: {
    views: number
    avgRating: number
  }
  poster: string
}

interface SeasonContextValue {
  seasons: SeasonItem[]
  modalOpen: boolean
  selectedSeason: SeasonItem | null
  openAddSeason: () => void
  openEditSeason: (season: SeasonItem) => void
  closeModal: () => void
  saveSeason: (seasonData: Partial<SeasonItem>) => void
  deleteSeason: (id: number) => void
  viewSeason: (season: SeasonItem) => void
  manageEpisodes: (season: SeasonItem) => void
}

const SeasonContext = createContext<SeasonContextValue | null>(null)

interface SeasonProviderProps {
  children: React.ReactNode
}

const initialSeasons: SeasonItem[] = [
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
]

export function SeasonProvider({ children }: SeasonProviderProps) {
  const [seasons, setSeasons] = useState<SeasonItem[]>(initialSeasons)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<SeasonItem | null>(null)

  const value = useMemo<SeasonContextValue>(
    () => ({
      seasons,
      modalOpen,
      selectedSeason,
      openAddSeason: () => {
        setSelectedSeason(null)
        setModalOpen(true)
      },
      openEditSeason: season => {
        setSelectedSeason(season)
        setModalOpen(true)
      },
      closeModal: () => {
        setModalOpen(false)
        setSelectedSeason(null)
      },
      saveSeason: seasonData => {
        if (selectedSeason) {
          setSeasons(prev =>
            prev.map(season => (season.id === selectedSeason.id ? { ...season, ...seasonData } : season))
          )
          setModalOpen(false)
          setSelectedSeason(null)
          return
        }

        const newSeason: SeasonItem = {
          id: Math.max(...seasons.map(s => s.id)) + 1,
          seasonNumber: Math.max(...seasons.map(s => s.seasonNumber)) + 1,
          title: seasonData.title || '',
          description: seasonData.description || '',
          releaseDate: seasonData.releaseDate || '',
          status: seasonData.status || 'draft',
          poster: seasonData.poster || '',
          episodes: 0,
          totalDuration: '0h 0m',
          stats: { views: 0, avgRating: 0 }
        }

        setSeasons(prev => [...prev, newSeason])
        setModalOpen(false)
        setSelectedSeason(null)
      },
      deleteSeason: id => {
        const season = seasons.find(s => s.id === id)

        if (season && season.episodes > 0) {
          alert('Cannot delete season with episodes. Please remove all episodes first.')
          return
        }

        setSeasons(prev => prev.filter(seasonItem => seasonItem.id !== id))
      },
      viewSeason: season => {
        console.log('View season details:', season)
      },
      manageEpisodes: season => {
        console.log('Manage episodes for season:', season)
      }
    }),
    [modalOpen, seasons, selectedSeason]
  )

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
}

export function useSeason() {
  const context = useContext(SeasonContext)

  if (!context) {
    throw new Error('useSeason must be used inside SeasonProvider')
  }

  return context
}
