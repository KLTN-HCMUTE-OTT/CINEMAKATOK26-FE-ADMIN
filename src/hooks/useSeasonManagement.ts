import { useEffect, useMemo, useState } from 'react'

export interface TempEpisode {
  tempId: string
  episodeNumber: number
  episodeTitle: string
  episodeDuration: number
  video?: API.UpdateVideoDto | null
}

export interface TempSeason {
  seasonNumber: number
  episodes: TempEpisode[]
}

interface UseSeasonManagementParams {
  initialSeasons: API.CreateSeasonDto[]
  onComplete: (seasons: API.CreateSeasonDto[]) => void
}

export function useSeasonManagement({ initialSeasons, onComplete }: UseSeasonManagementParams) {
  const [seasons, setSeasons] = useState<TempSeason[]>(
    initialSeasons.map(s => ({
      ...s,
      episodes: s.episodes.map(e => ({
        ...e,
        tempId: `temp-${Date.now()}-${Math.random()}`,
        video: e.video || null
      }))
    }))
  )

  const [expandedSeason, setExpandedSeason] = useState<number | null>(null)
  const [editingSeason, setEditingSeason] = useState<number | null>(null)
  const [editingEpisode, setEditingEpisode] = useState<string | null>(null)
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const getTotalEpisodes = () => seasons.reduce((total, season) => total + season.episodes.length, 0)

  const getEpisodesWithoutVideo = () => {
    let count = 0

    seasons.forEach(season => {
      season.episodes.forEach(episode => {
        if (!episode.video || episode.video === null || !episode.video.videoUrl) count++
      })
    })

    return count
  }

  const episodesWithoutVideoCount = useMemo(() => getEpisodesWithoutVideo(), [seasons])

  useEffect(() => {
    if (episodesWithoutVideoCount > 0) {
      console.warn(`⚠️ ${episodesWithoutVideoCount} episode(s) are missing videos!`)
    }
  }, [episodesWithoutVideoCount])

  const handleAddSeason = () => {
    const newSeason: TempSeason = {
      seasonNumber: seasons.length + 1,
      episodes: []
    }

    setSeasons(prev => [...prev, newSeason])
  }

  const handleSaveSeason = (seasonNumber: number, seasonData: Partial<TempSeason>) => {
    setSeasons(prev => prev.map(s => (s.seasonNumber === seasonNumber ? { ...s, ...seasonData } : s)))
    setEditingSeason(null)
  }

  const handleDeleteSeason = (seasonNumber: number) => {
    if (!confirm('Are you sure you want to delete this season and all its episodes?')) {
      return
    }

    setSeasons(prev =>
      prev
        .filter(s => s.seasonNumber !== seasonNumber)
        .map((s, index) => ({
          ...s,
          seasonNumber: index + 1
        }))
    )

    if (expandedSeason === seasonNumber) {
      setExpandedSeason(null)
    }
  }

  const handleAddEpisode = (seasonNumber: number) => {
    const season = seasons.find(s => s.seasonNumber === seasonNumber)

    if (!season) return

    const newEpisode: TempEpisode = {
      tempId: `temp-${Date.now()}-${Math.random()}`,
      episodeNumber: season.episodes.length + 1,
      episodeTitle: '',
      episodeDuration: 0,
      video: null
    }

    setSeasons(prev =>
      prev.map(s =>
        s.seasonNumber === seasonNumber
          ? {
              ...s,
              episodes: [...s.episodes, newEpisode]
            }
          : s
      )
    )

    setEditingEpisode(newEpisode.tempId)
  }

  const handleSaveEpisode = (
    seasonNumber: number,
    tempId: string,
    episodeData: {
      episodeTitle: string
      episodeDuration: number
      video: API.UpdateVideoDto
    }
  ) => {
    setSeasons(prev =>
      prev.map(s =>
        s.seasonNumber === seasonNumber
          ? {
              ...s,
              episodes: s.episodes.map(e => (e.tempId === tempId ? { ...e, ...episodeData } : e))
            }
          : s
      )
    )

    setEditingEpisode(null)
  }

  const handleDeleteEpisode = (seasonNumber: number, tempId: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) {
      return
    }

    setSeasons(prev =>
      prev.map(s =>
        s.seasonNumber === seasonNumber
          ? {
              ...s,
              episodes: s.episodes
                .filter(e => e.tempId !== tempId)
                .map((e, index) => ({
                  ...e,
                  episodeNumber: index + 1
                }))
            }
          : s
      )
    )
  }

  const handleComplete = () => {
    const errors: string[] = []

    if (seasons.length === 0) {
      errors.push('TV series must have at least one season')
    }

    const seasonsWithoutEpisodes = seasons.filter(s => s.episodes.length === 0)

    if (seasonsWithoutEpisodes.length > 0) {
      seasonsWithoutEpisodes.forEach(s => {
        errors.push(`Season ${s.seasonNumber} has no episodes (minimum 1 required)`)
      })
    }

    seasons.forEach(season => {
      season.episodes.forEach(episode => {
        const episodeErrors: string[] = []

        if (!episode.episodeTitle || episode.episodeTitle.trim() === '') {
          episodeErrors.push('missing title')
        }

        if (!episode.episodeDuration || episode.episodeDuration <= 0) {
          episodeErrors.push('invalid duration (must be > 0)')
        }

        if (!episode.video || episode.video === null || !episode.video.videoUrl) {
          episodeErrors.push('NO VIDEO UPLOADED (REQUIRED)')
        }

        if (episodeErrors.length > 0) {
          errors.push(`Season ${season.seasonNumber}, Episode ${episode.episodeNumber}: ${episodeErrors.join(', ')}`)
        }
      })
    })

    if (errors.length > 0) {
      console.error('Validation failed:', errors)
      setValidationErrors(errors)
      setValidationDialogOpen(true)

      return
    }

    const cleanedSeasons: API.CreateSeasonDto[] = seasons.map(s => ({
      seasonNumber: s.seasonNumber,
      episodes: s.episodes.map(e => {
        if (!e.video || e.video === null || !e.video.videoUrl) {
          throw new Error(`Episode ${e.episodeNumber} is missing video data`)
        }

        return {
          episodeNumber: e.episodeNumber,
          episodeTitle: e.episodeTitle,
          episodeDuration: e.episodeDuration,
          video: e.video
        }
      })
    }))

    onComplete(cleanedSeasons)
  }

  return {
    seasons,
    expandedSeason,
    editingSeason,
    editingEpisode,
    validationDialogOpen,
    validationErrors,
    episodesWithoutVideoCount,
    setExpandedSeason,
    setEditingSeason,
    setEditingEpisode,
    setValidationDialogOpen,
    handleAddSeason,
    handleSaveSeason,
    handleDeleteSeason,
    handleAddEpisode,
    handleSaveEpisode,
    handleDeleteEpisode,
    handleComplete,
    getTotalEpisodes
  }
}
