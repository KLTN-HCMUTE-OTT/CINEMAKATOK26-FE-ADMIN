import { useState } from 'react'

// API Imports
import { actorsControllerGetActorById } from '@/api/actors'
import { directorsControllerGetDirectorById } from '@/api/directors'
import { contentsControllerUpdateContent } from '@/api/contents'
import { moviesControllerUpdateMovie } from '@/api/movies'
import { streamingControllerUploadVideo } from '@/api/streaming'

interface UseMovieUpdateProps {
  movieId: string
  movie: any
  onSuccess: () => void
  onError: (error: string) => void
}

export const useMovieUpdate = ({ movieId, movie, onSuccess, onError }: UseMovieUpdateProps) => {
  const [saving, setSaving] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)

  const fetchFullActors = async (selectedActors: any[]) => {
    const actorPromises = selectedActors.map((a: any) =>
      actorsControllerGetActorById({ id: a.id }).catch(err => {
        console.error(`Failed to fetch actor ${a.id}:`, err)
        return null
      })
    )
    const actorResponses = await Promise.all(actorPromises)

    return actorResponses
      .filter(res => {
        if (!res || !res.data?.data) {
          console.warn('Actor data not found, skipping...')
          return false
        }
        return true
      })
      .map(res => {
        const actor = res!.data.data
        const { createdAt, updatedAt, contents, contentCount, ...actorWithoutTimestamps } = actor

        return {
          ...actorWithoutTimestamps,
          dateOfBirth: actor.dateOfBirth || '1/1/2025',
          gender: actor.gender || 'OTHER',
          bio: actor.bio || '',
          profilePicture: actor.profilePicture || '',
          nationality: actor.nationality || ''
        }
      })
  }

  const fetchFullDirectors = async (selectedDirectors: any[]) => {
    const directorPromises = selectedDirectors.map((d: any) =>
      directorsControllerGetDirectorById({ id: d.id }).catch(err => {
        console.error(`Failed to fetch director ${d.id}:`, err)
        return null
      })
    )
    const directorResponses = await Promise.all(directorPromises)

    return directorResponses
      .filter(res => {
        if (!res || !res.data?.data) {
          console.warn('Director data not found, skipping...')
          return false
        }
        return true
      })
      .map(res => {
        const director = res!.data.data
        const { createdAt, updatedAt, contents, contentCount, ...directorWithoutTimestamps } = director

        return {
          ...directorWithoutTimestamps,
          dateOfBirth: director.dateOfBirth || '1/1/2025',
          gender: director.gender || 'OTHER',
          bio: director.bio || '',
          profilePicture: director.profilePicture || '',
          nationality: director.nationality || ''
        }
      })
  }

  const uploadVideo = async (videoFile: File): Promise<API.VideoDto> => {
    setUploadingVideo(true)
    try {
      const uploadResponse = await streamingControllerUploadVideo({}, videoFile, {
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setVideoUploadProgress(percentCompleted)
          }
        }
      })

      const videoDto: API.VideoDto | undefined = uploadResponse.data?.data?.video

      if (!videoDto?.id) {
        throw new Error('Invalid video upload response')
      }

      return videoDto
    } finally {
      setUploadingVideo(false)
    }
  }

  const updateMovie = async (formData: {
    title: string
    description: string
    thumbnail: string
    banner: string
    trailer: string
    releaseDate: string
    duration: number
    imdbRating?: number
    avgRating?: number
    type: 'MOVIE' | 'TV_SERIES'
    maturityRating: string
    accessTier?: 'BASIC' | 'PREMIUM'
    selectedCategories: any[]
    selectedTags: any[]
    selectedActors: any[]
    selectedDirectors: any[]
    videoFile: File | null
  }) => {
    try {
      setSaving(true)

      // Fetch full actor and director data
      const fullActors = await fetchFullActors(formData.selectedActors)
      const fullDirectors = await fetchFullDirectors(formData.selectedDirectors)
      console.log('ratings: ', formData.imdbRating, formData.avgRating)
      // Update content
      const contentData: any = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail,
        banner: formData.banner,
        releaseDate: formData.releaseDate,
        type: formData.type === 'TV_SERIES' ? 'TVSERIES' : 'MOVIE',
        maturityRating: formData.maturityRating,
        accessTier: formData.accessTier || 'BASIC',
        trailer: formData.trailer,
        imdbRating: formData.imdbRating ?? 0,
        avgRating: formData.avgRating ?? 0,
        categories: formData.selectedCategories.map((c: any) => ({
          id: c.id,
          categoryName: c.categoryName
        })),
        tags: formData.selectedTags.map((t: any) => ({
          id: t.id,
          tagName: t.tagName
        })),
        actors: fullActors,
        directors: fullDirectors
      }

      const contentResponse = await contentsControllerUpdateContent({ id: movie!.metaData!.id }, contentData)

      const { deletedAt, rating, viewCount, ...cleanMetaData } = contentResponse.data.data as any
      cleanMetaData.accessTier = formData.accessTier || 'BASIC'

      // Upload video if provided
      let finalVideoDto = movie?.video
      if (formData.videoFile) {
        finalVideoDto = await uploadVideo(formData.videoFile)
      }

      if (!finalVideoDto || !finalVideoDto.id) {
        throw new Error('Video data is required')
      }

      // Update movie
      const movieData: API.UpdateMovieDto = {
        duration: formData.duration,
        metaData: cleanMetaData,
        video: finalVideoDto || null
      }

      await moviesControllerUpdateMovie({ id: movieId }, movieData)
      onSuccess()
    } catch (err: any) {
      console.error('Error updating movie:', err)
      onError(err?.response?.data?.message || 'Failed to update movie')
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    uploadingVideo,
    videoUploadProgress,
    updateMovie
  }
}
