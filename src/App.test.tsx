import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('proposal live editing', () => {
  it('renders an editable cover headline as individually composed words without losing its accessible title', () => {
    render(<App />)
    const title = screen.getByRole('heading', { name: 'THE WEDDING STORY' })
    expect(Array.from(title.children).map(word => word.textContent?.trim())).toEqual(['THE', 'WEDDING', 'STORY'])
  })
  it('updates the couple name in the proposal as the editor changes', async () => {
    const user = userEvent.setup()
    render(<App />)

    const brideInput = screen.getByLabelText('Bride name')
    await user.clear(brideInput)
    await user.type(brideInput, 'Linh')

    expect(screen.getByTestId('cover-couple')).toHaveTextContent('LINH & HUY')
  })

  it('updates an event and service price with a recalculated total', async () => {
    const user = userEvent.setup()
    render(<App />)

    const priceInput = screen.getByLabelText('Photography price for Lễ Vu Quy')
    await user.clear(priceInput)
    await user.type(priceInput, '5000000')

    const eventName = screen.getByLabelText('Event 1 name')
    await user.clear(eventName)
    await user.type(eventName, 'Lễ Gia Tiên')

    expect(screen.getAllByText('LỄ GIA TIÊN').length).toBeGreaterThan(0)
    expect(screen.getByTestId('total-investment')).toHaveTextContent('22.500.000 VND')
  })

  it('keeps edits when switching between mobile modes', async () => {
    const user = userEvent.setup()
    render(<App />)

    const groomInput = screen.getByLabelText('Groom name')
    await user.clear(groomInput)
    await user.type(groomInput, 'Minh')
    await user.click(screen.getByRole('button', { name: 'Xem trước' }))

    expect(screen.getByTestId('cover-couple')).toHaveTextContent('NGỌC & MINH')
  })

  it('updates the proposal title and shared wedding date wherever they are shown', async () => {
    const user = userEvent.setup()
    render(<App />)

    const titleInput = screen.getByLabelText('Proposal title')
    await user.clear(titleInput)
    await user.type(titleInput, 'A Quiet Celebration')

    const dateInput = screen.getByLabelText('Wedding date')
    await user.clear(dateInput)
    await user.type(dateInput, '20 — 21 March 2027')

    expect(screen.getByRole('heading', { name: 'A QUIET CELEBRATION' })).toBeInTheDocument()
    expect(screen.getByText('20 — 21 March 2027')).toBeInTheDocument()
  })
})
