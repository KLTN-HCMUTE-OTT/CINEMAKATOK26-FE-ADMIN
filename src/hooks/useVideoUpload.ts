import { uploadVideoDirect } from '@/utils/uploadVideoDirect'

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

export const useVideoUpload = () => {
  // Extract video duration using HTML5 Video API
  const extractVideoDuration = (file: File): Promise<{ minutes: number; formatted: string }> => {
    return new Promise(resolve => {
      const video = document.createElement('video')

      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const durationInSeconds = Math.floor(video.duration)

        // Calculate minutes (round up for API, min 1 minute)
        const totalMinutes = Math.max(1, Math.ceil(durationInSeconds / 60))

        // Calculate hours and minutes for display
        const hours = Math.floor(durationInSeconds / 3600)
        const minutes = Math.floor((durationInSeconds % 3600) / 60)
        const seconds = durationInSeconds % 60

        // Format for display
        let formatted = ''

        if (durationInSeconds < 60) {
          formatted = `${seconds}s`
        } else if (hours > 0) {
          formatted = `${hours}h ${minutes}m`
        } else {
          formatted = `${minutes}m ${seconds}s`
        }

        console.log(`Duration extracted: ${durationInSeconds}s = ${totalMinutes} minutes (${formatted})`)
        resolve({ minutes: totalMinutes, formatted })
      }

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src)
        resolve({ minutes: 0, formatted: 'Unknown' })
      }

      video.src = URL.createObjectURL(file)
    })
  }

  // Upload video to API
  const uploadVideoToAPI = async (
    videoFile: VideoFile,
    onProgressUpdate: (fileId: string, progress: number, status: VideoFile['status']) => void
  ): Promise<API.VideoDto | null> => {
    if (!videoFile.file) return null

    try {
      // Update to uploading status
      onProgressUpdate(videoFile.id, 0, 'uploading')

      // Upload video
      const response = await uploadVideoDirect(videoFile.file, {
        onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

            onProgressUpdate(videoFile.id, percentCompleted, 'uploading')
          }
        }
      })

      const result = response.data
      const videoData: API.VideoDto | undefined = result.data?.video

      console.log(`Video uploaded successfully - ID: ${videoData?.id}, Status: ${videoData?.status}`)

      return videoData || null
    } catch (error: any) {
      console.error('Upload error:', error)
      onProgressUpdate(videoFile.id, 0, 'error')

      const errorMessage = error.response?.data?.message || error.message || `Failed to upload ${videoFile.name}`

      throw new Error(errorMessage)
    }
  }

  return {
    extractVideoDuration,
    uploadVideoToAPI
  }
}
