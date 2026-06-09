import { describe, it, expect, vi, beforeEach } from 'vitest'

import { render, screen, fireEvent } from '@/test/test-utils'
import TVSeriesMetadataForm from './TVSeriesMetadataForm'

// Mock the hook to isolate component rendering
const mockHook = {
  metadata: {
    title: '',
    description: '',
    releaseDate: '',
    thumbnail: '',
    banner: '',
    categories: []
  },
  categories: [],
  tags: [],
  actors: [],
  directors: [],
  loading: false,
  error: null as string | null,
  uploadingThumbnail: false,
  uploadingBanner: false,
  handleChange: vi.fn(),
  handleThumbnailUpload: vi.fn(),
  handleBannerUpload: vi.fn(),
  isFormValid: vi.fn().mockReturnValue(false)
}

vi.mock('../../hooks/useTVSeriesMetadataForm', () => ({
  useTVSeriesMetadataForm: () => mockHook
}))

// Mock sub-components to focus on the parent component's logic
vi.mock('./metadata-sections/BasicMetadataSection', () => ({
  default: () => <div data-testid="basic-metadata-section" />
}))
vi.mock('./metadata-sections/GenreSection', () => ({
  default: () => <div data-testid="genre-section" />
}))
vi.mock('./metadata-sections/CastSection', () => ({
  default: () => <div data-testid="cast-section" />
}))

describe('TVSeriesMetadataForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHook.loading = false
    mockHook.error = null
    mockHook.isFormValid.mockReturnValue(false)
  })

  it('renders loading state', () => {
    mockHook.loading = true
    render(<TVSeriesMetadataForm onComplete={vi.fn()} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockHook.error = 'Failed to load data'
    render(<TVSeriesMetadataForm onComplete={vi.fn()} />)
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders form sections when data is loaded', () => {
    render(<TVSeriesMetadataForm onComplete={vi.fn()} />)
    expect(screen.getByText('TV Series Information')).toBeInTheDocument()
    expect(screen.getByTestId('basic-metadata-section')).toBeInTheDocument()
    expect(screen.getByTestId('genre-section')).toBeInTheDocument()
    expect(screen.getByTestId('cast-section')).toBeInTheDocument()
  })

  it('submit button is disabled when form is invalid', () => {
    render(<TVSeriesMetadataForm onComplete={vi.fn()} />)
    const submitBtn = screen.getByRole('button', { name: /continue to seasons & episodes/i })

    expect(submitBtn).toBeDisabled()
  })

  it('submit button is enabled and calls onComplete when valid', () => {
    mockHook.isFormValid.mockReturnValue(true)
    const onComplete = vi.fn()

    render(<TVSeriesMetadataForm onComplete={onComplete} />)
    
    const submitBtn = screen.getByRole('button', { name: /continue to seasons & episodes/i })

    expect(submitBtn).toBeEnabled()
    
    fireEvent.click(submitBtn)
    expect(onComplete).toHaveBeenCalledWith(mockHook.metadata)
  })
})
