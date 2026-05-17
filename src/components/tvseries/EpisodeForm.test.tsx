import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import EpisodeForm from './EpisodeForm'

// Mock useVideoUpload hook
const mockUploadVideoToAPI = vi.fn()
const mockExtractVideoDuration = vi.fn()

vi.mock('@/hooks/useVideoUpload', () => ({
  useVideoUpload: () => ({
    uploadVideoToAPI: mockUploadVideoToAPI,
    extractVideoDuration: mockExtractVideoDuration
  })
}))

describe('EpisodeForm', () => {
  const defaultEpisode = {
    episodeNumber: 1,
    episodeTitle: 'Pilot',
    episodeDuration: 0,
    video: null
  }

  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // By default mock successful extraction and upload
    mockExtractVideoDuration.mockResolvedValue({ minutes: 45 })
    mockUploadVideoToAPI.mockResolvedValue({
      id: 'video-123',
      thumbnailUrl: 'thumb.jpg',
      videoUrl: 'video.mp4',
      status: 'ready'
    })
  })

  it('renders initial data correctly', () => {
    render(<EpisodeForm episode={defaultEpisode} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/episode title/i)).toHaveValue('Pilot')
    expect(screen.getByText('Upload Video')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    render(<EpisodeForm episode={defaultEpisode} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows alert if title is empty on save', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Provide a video so the Save button is enabled (disabled={uploadingVideo || !video}).
    // Without a video, the button stays disabled and can never be clicked.
    const episodeWithVideo = {
      ...defaultEpisode,
      episodeTitle: '',
      video: { id: 'v1', thumbnailUrl: '', videoUrl: 'v.mp4', status: 'ready' }
    }

    render(<EpisodeForm episode={episodeWithVideo} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByRole('button', { name: /save episode/i }))
    expect(alertMock).toHaveBeenCalledWith('Please enter episode title')
    expect(mockOnSave).not.toHaveBeenCalled()
    alertMock.mockRestore()
  })

  it('save button is disabled when no video is uploaded', () => {
    render(<EpisodeForm episode={defaultEpisode} onSave={mockOnSave} onCancel={mockOnCancel} />)

    const saveButton = screen.getByRole('button', { name: /save episode/i })
    expect(saveButton).toBeDisabled()
  })

  it('handles video upload and updates duration', async () => {
    const user = userEvent.setup()
    render(<EpisodeForm episode={defaultEpisode} onSave={mockOnSave} onCancel={mockOnCancel} />)
    
    // Create a mock file
    const file = new File(['dummy content'], 'episode1.mp4', { type: 'video/mp4' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    // Trigger upload
    await user.upload(input, file)
    
    // Wait for the upload process to finish
    await waitFor(() => {
      expect(mockExtractVideoDuration).toHaveBeenCalledWith(file)
    })
    
    await waitFor(() => {
      expect(mockUploadVideoToAPI).toHaveBeenCalled()
    })
  })
})
