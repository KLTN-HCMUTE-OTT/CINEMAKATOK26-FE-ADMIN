import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import PromotionModal from './PromotionModal'

describe('PromotionModal', () => {
  const mockOnClose = vi.fn()
  const mockOnSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<PromotionModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)

    expect(screen.getByText('Add New Promotion')).toBeInTheDocument()
    expect(screen.getByLabelText(/promotion name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/value/i, { selector: 'input[type="number"]' })).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<PromotionModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('save button is disabled when required fields are empty', () => {
    render(<PromotionModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)

    const saveButton = screen.getByRole('button', { name: /add promotion/i })
    expect(saveButton).toBeDisabled()
  })

  it('enables save button and calls onSave with data when fields are filled', async () => {
    const user = userEvent.setup()
    render(<PromotionModal open={true} onClose={mockOnClose} onSave={mockOnSave} />)

    await user.type(screen.getByLabelText(/promotion name/i), 'Summer Sale')
    
    // MUI number inputs might need clearing first or just typing
    const valueInput = screen.getByLabelText(/value/i, { selector: 'input[type="number"]' })
    await user.type(valueInput, '20')

    const startDateInput = screen.getByLabelText(/start date/i)
    fireEvent.change(startDateInput, { target: { value: '2024-06-01' } })

    const endDateInput = screen.getByLabelText(/end date/i)
    fireEvent.change(endDateInput, { target: { value: '2024-06-30' } })

    const saveButton = screen.getByRole('button', { name: /add promotion/i })
    expect(saveButton).toBeEnabled()

    fireEvent.click(saveButton)

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Summer Sale',
      value: 20,
      startDate: '2024-06-01',
      endDate: '2024-06-30'
    }))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('initializes with provided data for editing', () => {
    const initialData = {
      name: 'Black Friday',
      type: 'discount',
      value: 50,
      valueType: 'percentage',
      startDate: '2024-11-20',
      endDate: '2024-11-30',
      targetAudience: 'All Users',
      maxUsage: 100,
      status: 'active'
    }

    render(
      <PromotionModal 
        open={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
        initialData={initialData} 
        title="Update Promotion" 
      />
    )

    expect(screen.getByLabelText(/promotion name/i)).toHaveValue('Black Friday')
    expect(screen.getByLabelText(/value/i, { selector: 'input[type="number"]' })).toHaveValue(50)
    
    const saveButton = screen.getByRole('button', { name: /update promotion/i })
    expect(saveButton).toBeEnabled()
  })
})
