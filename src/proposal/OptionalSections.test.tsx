import { render, screen, within } from '@testing-library/react'
import { demoProposal } from '../data/demoProposal'
import { ProposalDocument } from './ProposalDocument'

describe('optional sections rendering', () => {
  it('omits enabled whitespace-only sections and empty contact entirely', () => {
    const { container } = render(<ProposalDocument proposal={{ ...demoProposal,
      introduction: { enabled: true, text: ' \n ' }, notes: { enabled: true, items: ['', '  '] }, terms: { enabled: true, items: [] },
      contact: { enabled: true, studioName: ' ', phone: '' },
    }} />)
    expect(container.querySelector('.proposal-introduction')).toBeNull()
    expect(container.querySelector('.proposal-notes')).toBeNull()
    expect(container.querySelector('.proposal-terms')).toBeNull()
    expect(container.querySelector('.document-footer')).toBeNull()
    expect(screen.getByTestId('total-investment')).toHaveTextContent('22.000.000 VND')
  })
  it('preserves Vietnamese body case and line breaks, filters blank list items before numbering', () => {
    const { container } = render(<ProposalDocument proposal={{ ...demoProposal,
      introduction: { enabled: true, text: 'Cảm ơn Ngọc & Huy đã tin tưởng Solis Studio.\nNgày cưới của hai bạn.' },
      notes: { enabled: true, items: [' ', 'Chi phí di chuyển ngoài khu vực Trà Vinh được tính riêng.'] },
      terms: { enabled: true, items: ['Đặt cọc 30% để xác nhận lịch.'] },
    }} />)
    expect(screen.getByText(/Cảm ơn Ngọc & Huy/)).toBeInTheDocument()
    const note = within(screen.getByRole('region', { name: 'Ghi chú' })).getAllByRole('listitem')
    expect(note).toHaveLength(1)
    expect(within(note[0]).getByText('01')).toBeInTheDocument()
    expect(within(note[0]).getByText('Chi phí di chuyển ngoài khu vực Trà Vinh được tính riêng.')).toBeInTheDocument()
    expect(screen.getByText('Đặt cọc 30% để xác nhận lịch.')).toBeInTheDocument()
    expect(container.querySelectorAll('#proposal-document')).toHaveLength(1)
  })
})
