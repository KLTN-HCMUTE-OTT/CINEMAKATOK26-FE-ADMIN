import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('@/utils/uploadVideoDirect', () => ({
  uploadVideoDirect: vi.fn()
}))

import { useVideoUpload } from './useVideoUpload'
import { uploadVideoDirect } from '@/utils/uploadVideoDirect'

const mockedUploadApi = vi.mocked(uploadVideoDirect)

describe('useVideoUpload', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('uploadVideoToAPI', () => {
    const createVideoFile = (file?: File) => ({
      id: 'v1',
      name: 'test.mp4',
      size: 1024 * 1024,
      progress: 0,
      status: 'uploading' as const,
      file
    })

    it('returns null when no file is attached', async () => {
      // Arrange
      const { result } = renderHook(() => useVideoUpload())
      const onProgress = vi.fn()

      // Act
      const response = await result.current.uploadVideoToAPI(createVideoFile(), onProgress)

      // Assert
      expect(response).toBeNull()
      expect(mockedUploadApi).not.toHaveBeenCalled()
      expect(onProgress).not.toHaveBeenCalled()
    })

    it('uploads file and returns video data on success', async () => {
      // Arrange
      const mockVideoData = { id: 'video-abc', status: 'transcoding', url: 'https://cdn/video.mp4' }

      mockedUploadApi.mockResolvedValue({
        data: { data: { video: mockVideoData } }
      } as any)

      const { result } = renderHook(() => useVideoUpload())
      const onProgress = vi.fn()
      const file = new File(['video-content'], 'movie.mp4', { type: 'video/mp4' })

      // Act
      const response = await result.current.uploadVideoToAPI(createVideoFile(file), onProgress)

      // Assert
      expect(response).toEqual(mockVideoData)
      expect(onProgress).toHaveBeenCalledWith('v1', 0, 'uploading')
      expect(mockedUploadApi).toHaveBeenCalledWith(file, expect.objectContaining({ onUploadProgress: expect.any(Function) }))
    })

    it('sets error status and throws on upload failure with API message', async () => {
      // Arrange
      mockedUploadApi.mockRejectedValue({
        response: { data: { message: 'File too large (max 2GB)' } }
      })

      const { result } = renderHook(() => useVideoUpload())
      const onProgress = vi.fn()
      const file = new File(['x'], 'big.mp4', { type: 'video/mp4' })

      // Act & Assert
      await expect(result.current.uploadVideoToAPI(createVideoFile(file), onProgress)).rejects.toThrow(
        'File too large (max 2GB)'
      )
      expect(onProgress).toHaveBeenCalledWith('v1', 0, 'error')
    })

    it('uses generic error message when API response lacks message', async () => {
      // Arrange
      mockedUploadApi.mockRejectedValue(new Error('Network Error'))

      const { result } = renderHook(() => useVideoUpload())
      const onProgress = vi.fn()
      const file = new File(['x'], 'fail.mp4', { type: 'video/mp4' })

      // Act & Assert
      await expect(result.current.uploadVideoToAPI(createVideoFile(file), onProgress)).rejects.toThrow('Network Error')
    })

    it('returns null when API returns no video data', async () => {
      // Arrange
      mockedUploadApi.mockResolvedValue({
        data: { data: { video: undefined } }
      } as any)

      const { result } = renderHook(() => useVideoUpload())
      const onProgress = vi.fn()
      const file = new File(['x'], 'no-result.mp4', { type: 'video/mp4' })

      // Act
      const response = await result.current.uploadVideoToAPI(createVideoFile(file), onProgress)

      // Assert
      expect(response).toBeNull()
    })
  })
})
