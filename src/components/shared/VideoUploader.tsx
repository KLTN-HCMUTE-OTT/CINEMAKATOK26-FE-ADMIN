'use client'

// React Imports
import { useState, useCallback, useEffect, useRef } from 'react'

// MUI Imports
import { Grid } from '@mui/material'

// Components Imports
import UploadDropzone from './video-uploader/UploadDropzone'
import MetadataForm from './video-uploader/MetadataForm'
import UploadProgress from './video-uploader/UploadProgress'

// API Imports
import { categoriesControllerGetCategories } from '@/api/categories'
import { tagsControllerGetTags } from '@/api/tags'
import { actorsControllerGetActors } from '@/api/actors'
import { directorsControllerGetDirectors } from '@/api/directors'

// Hooks
import { useVideoUpload } from '@/hooks/useVideoUpload'
import { useCloudinaryImageUpload } from '@/hooks/useCloudinaryImageUpload'

// Types
import type { MetadataErrors } from './video-uploader/types'

interface VideoFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'uploading' | 'transcoding' | 'ready' | 'error'
  quality?: string
  duration?: string
  durationInMinutes?: number
  thumbnail?: string
  videoData?: API.VideoDto
  file?: File
}

interface VideoMetadata {
  type: 'MOVIE' | 'TVSERIES'
  title: string
  description: string
  releaseDate: string
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-Y' | 'TV-PG' | 'TV-14' | 'TV-MA'
  accessTier: 'BASIC' | 'PREMIUM'
  thumbnail: string
  banner: string
  trailer: string
  imdbRating: number
  avgRating: number
  categories: Array<{ id: string; categoryName: string }>
  tags: Array<{ id: string; tagName: string }>
  actors: Array<{ id: string; name: string }>
  directors: Array<{ id: string; name: string }>
}

interface VideoUploaderProps {
  onUpload?: (files: VideoFile[], metadata: VideoMetadata) => void
  maxFileSize?: number
  acceptedFormats?: string[]
  uploadedFiles?: VideoFile[]
  initialMetadata?: VideoMetadata | null
  onChange?: (files: VideoFile[], metadata: VideoMetadata) => void
}

const VideoUploader = ({
  onUpload,
  maxFileSize = 5000,
  acceptedFormats = ['.mp4', '.mov', '.avi', '.mkv'],
  uploadedFiles = [],
  initialMetadata = null,
  onChange
}: VideoUploaderProps) => {
  // States
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<VideoFile[]>([])
  const [existingFiles, setExistingFiles] = useState<VideoFile[]>(uploadedFiles)

  // Data states
  const [categories, setCategories] = useState<API.CategoryDto[]>([])
  const [tags, setTags] = useState<API.TagDto[]>([])
  const [actors, setActors] = useState<API.ActorDto[]>([])
  const [directors, setDirectors] = useState<API.DirectorDto[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<MetadataErrors>({})

  const [metadata, setMetadata] = useState<VideoMetadata>(() => {
    // Restore form values from parent state when navigating back
    if (initialMetadata) {
      return initialMetadata
    }

    return {
      type: 'MOVIE',
      title: '',
      description: '',
      releaseDate: '',
      maturityRating: 'PG-13',
      accessTier: 'BASIC',
      thumbnail: '',
      banner: '',
      trailer: '',
      imdbRating: 0,
      avgRating: 0,
      categories: [],
      tags: [],
      actors: [],
      directors: []
    }
  })

  // Always keep a ref to the latest metadata so handleProcessVideos never reads a stale closure
  const metadataRef = useRef(metadata)

  useEffect(() => {
    metadataRef.current = metadata
  })

  const validateMetadata = (m: VideoMetadata): MetadataErrors => {
    const e: MetadataErrors = {}

    if (!m.title.trim()) e.title = 'Title is required'
    if (!m.description.trim()) e.description = 'Description is required'
    if (!m.releaseDate) e.releaseDate = 'Release date is required'
    if (!m.thumbnail) e.thumbnail = 'Thumbnail is required'
    if (!m.banner) e.banner = 'Banner is required'
    if (!m.trailer.trim()) e.trailer = 'Trailer URL is required'
    if (m.categories.length === 0) e.categories = 'At least one category is required'
    if (m.tags.length === 0) e.tags = 'At least one tag is required'
    if (m.actors.length === 0) e.actors = 'At least one actor is required'
    if (m.directors.length === 0) e.directors = 'At least one director is required'
    
return e
  }

  const handleMetadataChange = (newMetadata: VideoMetadata) => {
    setMetadata(newMetadata)

    if (Object.keys(errors).length > 0) {
      setErrors(prev => {
        const next = { ...prev }

        if (newMetadata.title.trim()) delete next.title
        if (newMetadata.description.trim()) delete next.description
        if (newMetadata.releaseDate) delete next.releaseDate
        if (newMetadata.thumbnail) delete next.thumbnail
        if (newMetadata.banner) delete next.banner
        if (newMetadata.trailer.trim()) delete next.trailer
        if (newMetadata.categories.length > 0) delete next.categories
        if (newMetadata.tags.length > 0) delete next.tags
        if (newMetadata.actors.length > 0) delete next.actors
        if (newMetadata.directors.length > 0) delete next.directors
        
return next
      })
    }
  }

  // Call onChange whenever existingFiles or metadata changes to sync with parent state
  useEffect(() => {
    if (onChange) {
      onChange(existingFiles, metadata)
    }
  }, [existingFiles, metadata, onChange])

  // Custom hooks
  const { extractVideoDuration, uploadVideoToAPI } = useVideoUpload()
  const { uploadingThumbnail, uploadingBanner, uploadThumbnailImage, uploadBannerImage } = useCloudinaryImageUpload()

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        const [categoriesRes, tagsRes, actorsRes, directorsRes] = await Promise.all([
          categoriesControllerGetCategories({ limit: 100, page: 1 }),
          tagsControllerGetTags({ limit: 100, page: 1 }),
          actorsControllerGetActors({ limit: 100, page: 1 }),
          directorsControllerGetDirectors({ limit: 100, page: 1 })
        ])

        if (categoriesRes?.data) setCategories(categoriesRes.data.data || [])
        if (tagsRes?.data) setTags(tagsRes.data.data || [])
        if (actorsRes?.data) setActors(actorsRes.data.data || [])
        if (directorsRes?.data) setDirectors(directorsRes.data.data || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      const files = Array.from(e.dataTransfer.files)

      handleFiles(files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // File handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      handleFiles(files)
      e.target.value = ''
    }
  }

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isValidFormat = acceptedFormats.includes(extension)
      const isValidSize = file.size <= maxFileSize * 1024 * 1024

      return isValidFormat && isValidSize
    })

    const videoFiles: VideoFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      file: file
    }))

    setUploadingFiles(prev => [...prev, ...videoFiles])

    // Process each file
    for (const videoFile of videoFiles) {
      try {
        // Extract duration
        const duration = await extractVideoDuration(videoFile.file!)

        console.log(`Video duration extracted for ${videoFile.name}:`, duration)

        // Update with duration
        videoFile.duration = duration.formatted
        videoFile.durationInMinutes = duration.minutes

        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === videoFile.id ? { ...f, durationInMinutes: duration.minutes, duration: duration.formatted } : f
          )
        )

        // Upload video
        const onProgressUpdate = (fileId: string, progress: number, status: VideoFile['status']) => {
          setUploadingFiles(prev => prev.map(f => (f.id === fileId ? { ...f, progress, status } : f)))
        }

        const videoData = await uploadVideoToAPI(videoFile, onProgressUpdate)

        if (videoData) {
          console.log(`Moving to existing files - Duration: ${duration.formatted} (${duration.minutes} minutes)`)

          // Remove from uploading
          setUploadingFiles(prev => prev.filter(f => f.id !== videoFile.id))

          // Add to existing
          setExistingFiles(prev => [
            ...prev,
            {
              ...videoFile,
              progress: 100,
              status: videoData.status === 'FAILED' ? 'error' : 'ready',
              videoData: videoData,
              duration: duration.formatted,
              durationInMinutes: duration.minutes
            }
          ])
        }
      } catch (error: any) {
        console.error(`Error processing ${videoFile.name}:`, error)
        alert(error.message || `Failed to upload ${videoFile.name}`)
      }
    }
  }

  // Image upload handlers
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      const url = await uploadThumbnailImage(file)

      setMetadata(prev => ({ ...prev, thumbnail: url }))
      setErrors(prev => { const next = { ...prev };

 delete next.thumbnail; 

return next })
    } catch (error) {
      alert('Failed to upload thumbnail. Please try again.')
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    try {
      const url = await uploadBannerImage(file)

      setMetadata(prev => ({ ...prev, banner: url }))
      setErrors(prev => { const next = { ...prev };

 delete next.banner; 

return next })
    } catch (error) {
      alert('Failed to upload banner. Please try again.')
    }
  }

  const handleDeleteFile = (fileId: string) => {
    setExistingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleProcessVideos = () => {
    const validationErrors = validateMetadata(metadataRef.current)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      
return
    }

    setErrors({})

    if (onUpload) {
      const readyFiles = existingFiles.filter(f => f.videoData)

      onUpload(readyFiles, metadataRef.current)
    }
  }

  return (
    <Grid container spacing={3}>
      {/* Upload Area */}
      <Grid item xs={12}>
        <UploadDropzone
          isDragActive={isDragActive}
          acceptedFormats={acceptedFormats}
          maxFileSize={maxFileSize}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
        />
      </Grid>

      {/* Metadata Form */}
      <Grid item xs={12} md={6}>
        <MetadataForm
          metadata={metadata}
          categories={categories}
          tags={tags}
          actors={actors}
          directors={directors}
          loading={loading}
          uploadingThumbnail={uploadingThumbnail}
          uploadingBanner={uploadingBanner}
          errors={errors}
          onMetadataChange={handleMetadataChange}
          onThumbnailUpload={handleThumbnailUpload}
          onBannerUpload={handleBannerUpload}
        />
      </Grid>

      {/* Upload Progress */}
      <Grid item xs={12} md={6}>
        <UploadProgress
          uploadingFiles={uploadingFiles}
          existingFiles={existingFiles}
          onDeleteFile={handleDeleteFile}
          onProcessVideos={handleProcessVideos}
        />
      </Grid>
    </Grid>
  )
}

export default VideoUploader
