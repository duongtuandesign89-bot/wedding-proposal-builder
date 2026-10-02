import { render, screen, within } from '@testing-library/react'
import { demoProposal } from '../data/demoProposal'
import { ProposalPreview } from './ProposalPreview'

describe('proposal preview', () => {
  it('keeps couple issue information inside the photographic cover, without repeating it below', () => {
    const { container } = render(<ProposalPreview proposal={demoProposal} />)
    const hero = container.querySelector('.proposal-hero') as HTMLElement
    expect(within(hero).getByTestId('cover-couple')).toHaveTextContent('NGỌC & HUY')
    expect(within(hero).getByText('12 — 13 December 2026')).toBeInTheDocument()
    expect(screen.getAllByTestId('cover-couple')).toHaveLength(1)
  })

  it('reduces the secondary name type for long names while retaining all Vietnamese text', () => {
    const { rerender } = render(<ProposalPreview proposal={demoProposal} />)
    const normalSize = Number.parseFloat(screen.getByTestId('cover-couple').style.fontSize)
    rerender(<ProposalPreview proposal={{ ...demoProposal, couple: { brideName: 'Trần Thị Ngọc Ánh', groomName: 'Nguyễn Hoàng Phương' } }} />)
    const name = screen.getByTestId('cover-couple')
    expect(name).toHaveTextContent('TRẦN THỊ NGỌC ÁNH & NGUYỄN HOÀNG PHƯƠNG')
    expect(Number.parseFloat(name.style.fontSize)).toBeLessThan(normalSize)
  })
  it('renders one export document with all proposal content and no editor controls', () => {
    const { container } = render(<ProposalPreview proposal={demoProposal} />)
    expect(container.querySelectorAll('#proposal-document')).toHaveLength(1)
    const document = screen.getByRole('article', { name: 'Wedding proposal' })
    expect(within(document).queryByRole('button')).not.toBeInTheDocument()
    expect(within(document).getByTestId('total-investment')).toHaveTextContent('22.000.000 VND')
    expect(screen.getByRole('heading', { name: 'THE WEDDING STORY' })).toBeInTheDocument()
    expect(screen.queryByText(/3 pages/i)).not.toBeInTheDocument()
  })

  it('uses the Solis logo and meaningful image text', () => {
    render(<ProposalPreview proposal={demoProposal} />)

    expect(screen.getByAltText('Solis Studio')).toBeInTheDocument()
    expect(screen.getByAltText('Ngọc and Huy wedding cover')).toBeInTheDocument()
  })

  it('shows every wedding event, service, and the calculated investment', () => {
    render(<ProposalPreview proposal={demoProposal} />)

    expect(screen.getByText('LỄ VU QUY')).toBeInTheDocument()
    expect(screen.getByText('LỄ THÀNH HÔN')).toBeInTheDocument()
    expect(screen.getAllByText('Photography')).toHaveLength(2)
    expect(screen.getByTestId('total-investment')).toHaveTextContent('22.000.000 VND')
  })

  it('appends additional event content and notes within the same document', () => {
    const proposal = {
      ...demoProposal,
      notes: 'A private note.\nA second line.',
      events: [...demoProposal.events, {
        ...demoProposal.events[0], id: 'third-event', name: 'After Party',
        services: [{ id: 'extra', name: 'Evening coverage', price: 2_000_000 }],
      }],
    }
    const { container } = render(<ProposalPreview proposal={proposal} />)
    const document = screen.getByRole('article', { name: 'Wedding proposal' })
    expect(container.querySelectorAll('#proposal-document')).toHaveLength(1)
    expect(within(document).getByText('AFTER PARTY')).toBeInTheDocument()
    expect(within(document).getByText('Evening coverage')).toBeInTheDocument()
    expect(within(document).getByText(/A private note/)).toBeInTheDocument()
    expect(within(document).getByTestId('total-investment')).toHaveTextContent('24.000.000 VND')
  })
})
