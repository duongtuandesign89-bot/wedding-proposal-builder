import { render, screen } from '@testing-library/react'
import { demoProposal } from '../data/demoProposal'
import { ProposalPreview } from './ProposalPreview'

describe('flexible couple cover', () => {
  it.each([
    ['Ngọc', 'Huy', 'NGỌC & HUY', 'Ngọc & Huy'],
    ['Ngọc', '', 'NGỌC', 'Ngọc'],
    ['', 'Huy', 'HUY', 'Huy'],
    ['Ánh Đào', '', 'ÁNH ĐÀO', 'Ánh Đào'],
  ])('renders optional names %s / %s consistently', (brideName, groomName, cover, toolbar) => {
    const { container } = render(<ProposalPreview proposal={{ ...demoProposal, couple: { brideName, groomName } }} />)
    expect(screen.getByTestId('cover-couple').textContent).toBe(cover)
    expect(container.querySelector('.preview-toolbar strong')?.textContent).toBe(toolbar)
    expect(screen.getByTestId('cover-couple')).toHaveStyle({ fontSize: '48px' })
  })
  it('omits no-name cover text but keeps existing date/location composition', () => {
    const { container } = render(<ProposalPreview proposal={{ ...demoProposal, couple: { brideName: ' ', groomName: '' } }} />)
    expect(screen.queryByTestId('cover-couple')).not.toBeInTheDocument()
    expect(container.querySelector('.preview-toolbar strong')).toHaveTextContent('Wedding Proposal')
    expect(container.querySelector('.couple-details')).toHaveTextContent('Trà Vinh')
  })
})
