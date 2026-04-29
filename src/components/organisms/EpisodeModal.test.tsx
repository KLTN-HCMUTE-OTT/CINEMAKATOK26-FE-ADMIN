import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import EpisodeModal from './EpisodeModal'

vi.mock('@components/molecules/EpisodeBasicInfo', () => ({
  default: () => <div data-testid="episode-basic-info" />
}))
vi.mock('@components/molecules/EpisodeDetails', () => ({
  default: () => <div data-testid="episode-details" />
}))
vi.mock('@components/molecules/EpisodeThumbnail', () => ({
  default: () => <div data-testid="episode-thumbnail" />
}))
vi.mock('@components/molecules/EpisodeAssets', () => ({
  default: () => <div data-testid="episode-assets" />
}))
vi.mock('@components/molecules/ProductionGuidelines', () => ({
  default: () => <div data-testid="production-guidelines" />
}))

describe('EpisodeModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all sections', () => {
    render(<EpisodeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)

    expect(screen.getByText('Add New Episode')).toBeInTheDocument()
    expect(screen.getByTestId('episode-basic-info')).toBeInTheDocument()
    expect(screen.getByTestId('episode-details')).toBeInTheDocument()
    expect(screen.getByTestId('episode-thumbnail')).toBeInTheDocument()
    expect(screen.getByTestId('episode-assets')).toBeInTheDocument()
    expect(screen.getByTestId('production-guidelines')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<EpisodeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('disables save button when required fields are missing', () => {
    render(<EpisodeModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)
    
    const saveButton = screen.getByRole('button', { name: /add episode/i })
    expect(saveButton).toBeDisabled()
  })

  it('populates initial data if episode is provided', () => {
    const episode = {
      title: 'Existing Episode',
      description: 'This is an existing episode',
      season: 2,
      episodeNumber: 5
    }

    render(
      <EpisodeModal 
        open={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
        episode={episode} 
        title="Update Episode" 
      />
    )

    // Use getByRole to target the dialog title heading specifically,
    // avoiding the duplicate match with the button text
    expect(screen.getByRole('heading', { name: 'Update Episode' })).toBeInTheDocument()

    // The button text mirrors the title when it contains "Update"
    const saveButton = screen.getByRole('button', { name: /update episode/i })
    expect(saveButton).toBeEnabled()
    
    fireEvent.click(saveButton)
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Existing Episode',
      description: 'This is an existing episode',
      season: 2,
      episodeNumber: 5
    }))
  })
})
