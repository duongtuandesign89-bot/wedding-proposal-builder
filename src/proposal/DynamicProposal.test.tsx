import { render, screen } from '@testing-library/react'
import { demoProposal } from '../data/demoProposal'
import { ProposalDocument } from './ProposalDocument'

describe('dynamic proposal content', () => {
  it('omits empty section wrappers and has a zero total', () => {
    const { container } = render(<ProposalDocument proposal={{ ...demoProposal, events: [], adjustments: [] }} />)
    expect(container.querySelector('.document-events')).toBeNull()
    expect(container.querySelector('.proposal-adjustments')).toBeNull()
    expect(screen.getByTestId('total-investment')).toHaveTextContent('0 VND')
  })
  it('omits empty metadata and service lists but keeps event heading', () => {
    const event = { id: 'empty', name: 'Lễ Đính Hôn', date: '', startTime: '', endTime: '', location: '', services: [] }
    const { container } = render(<ProposalDocument proposal={{ ...demoProposal, events: [event] }} />)
    expect(screen.getByText('LỄ ĐÍNH HÔN')).toBeInTheDocument()
    expect(container.querySelector('.event-date')).toBeNull()
    expect(container.querySelector('.event-meta')).toBeNull()
    expect(container.querySelector('.event-services')).toBeNull()
  })
  it('shows optional descriptions without empty placeholders', () => {
    const event = { ...demoProposal.events[0], services: [
      { id: '1', name: 'Ảnh cưới', description: 'Hai nhiếp ảnh gia', price: 0 },
      { id: '2', name: 'Phim cưới', description: '  ', price: 0 },
    ] }
    const { container } = render(<ProposalDocument proposal={{ ...demoProposal, events: [event] }} />)
    expect(screen.getByText('Hai nhiếp ảnh gia')).toBeInTheDocument()
    expect(container.querySelectorAll('.service-description')).toHaveLength(1)
  })
  it('shows signed adjustments before a signed total without clamping discounts', () => {
    render(<ProposalDocument proposal={{ ...demoProposal, events: [], adjustments: [{ id: 'discount', name: 'Ưu đãi', amount: -1000000 }] }} />)
    expect(screen.getByRole('heading', { name: 'Phí & điều chỉnh' })).toBeInTheDocument()
    expect(screen.getByTestId('total-investment')).toHaveTextContent('−1.000.000 VND')
  })
})
