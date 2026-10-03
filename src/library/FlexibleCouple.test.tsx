import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { demoProposal } from '../data/demoProposal'
import { createMemoryRepository } from '../storage/proposalRepository'

describe('flexible couple library', () => {
  it.each([
    ['Ngọc', '', 'Ngọc'], ['', 'Huy', 'Huy'], ['', '', 'Báo giá chưa đặt tên'],
  ])('keeps single/empty names through library search and duplicate: %s / %s', async (brideName, groomName, label) => {
    const repository = createMemoryRepository()
    await repository.save({ ...demoProposal, couple: { brideName, groomName } }, null)
    render(<App repository={repository} />)
    expect(await screen.findByRole('button', { name: `Mở báo giá ${label}` })).toBeInTheDocument()
    if (brideName || groomName) {
      fireEvent.change(screen.getByLabelText('Tìm báo giá'), { target: { value: (brideName || groomName).toLocaleUpperCase('vi-VN') } })
      expect(screen.getByRole('button', { name: `Mở báo giá ${label}` })).toBeInTheDocument()
    }
    await userEvent.click(screen.getByRole('button', { name: `Nhân bản ${label}` }))
    const records = await repository.list()
    expect(records).toHaveLength(2)
    expect(records[0].proposal.couple).toEqual({ brideName, groomName })
  })
})
