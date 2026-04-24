import { useEffect, useState } from 'react'

import { actorsControllerGetActors } from '@/api/actors'
import { categoriesControllerGetCategories } from '@/api/categories'
import { directorsControllerGetDirectors } from '@/api/directors'
import { tagsControllerGetTags } from '@/api/tags'
import { useCloudinaryImageUpload } from '@/hooks/useCloudinaryImageUpload'

interface UseTVSeriesMetadataFormParams {
  initialData?: any
}

export function useTVSeriesMetadataForm({ initialData }: UseTVSeriesMetadataFormParams) {
  const [metadata, setMetadata] = useState({
    type: 'TVSERIES',
    title: initialData?.title || '',
    description: initialData?.description || '',
    releaseDate: initialData?.releaseDate || '',
    maturityRating: initialData?.maturityRating || 'PG-13',
    thumbnail: initialData?.thumbnail || '',
    banner: initialData?.banner || '',
    trailer: initialData?.trailer || '',
    imdbRating: initialData?.imdbRating || 0,
    avgRating: initialData?.avgRating || 0,
    categories: initialData?.categories || [],
    tags: initialData?.tags || [],
    actors: initialData?.actors || [],
    directors: initialData?.directors || []
  })

  const [categories, setCategories] = useState<API.CategoryDto[]>([])
  const [tags, setTags] = useState<API.TagDto[]>([])
  const [actors, setActors] = useState<API.ActorDto[]>([])
  const [directors, setDirectors] = useState<API.DirectorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { uploadingThumbnail, uploadingBanner, uploadThumbnailImage, uploadBannerImage } = useCloudinaryImageUpload()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const [categoriesRes, tagsRes, actorsRes, directorsRes] = await Promise.all([
          categoriesControllerGetCategories({ limit: 100 }),
          tagsControllerGetTags({ limit: 100 }),
          actorsControllerGetActors({ limit: 100 }),
          directorsControllerGetDirectors({ limit: 100 })
        ])

        setCategories(categoriesRes.data.data || [])
        setTags(tagsRes.data.data || [])
        setActors(actorsRes.data.data || [])
        setDirectors(directorsRes.data.data || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load form data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (field: string, value: any) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      const url = await uploadThumbnailImage(file)

      handleChange('thumbnail', url)
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Failed to upload thumbnail')
    }
  }

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    try {
      const url = await uploadBannerImage(file)

      handleChange('banner', url)
    } catch (error) {
      console.error('Error uploading banner:', error)
      alert('Failed to upload banner')
    }
  }

  const isFormValid = () => {
    return (
      metadata.title.trim() !== '' &&
      metadata.description.trim() !== '' &&
      metadata.releaseDate !== '' &&
      metadata.thumbnail !== '' &&
      metadata.banner !== '' &&
      metadata.categories.length > 0
    )
  }

  return {
    metadata,
    categories,
    tags,
    actors,
    directors,
    loading,
    error,
    uploadingThumbnail,
    uploadingBanner,
    handleChange,
    handleThumbnailUpload,
    handleBannerUpload,
    isFormValid
  }
}
