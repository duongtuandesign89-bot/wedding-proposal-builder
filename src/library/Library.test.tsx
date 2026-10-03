import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IDBFactory } from 'fake-indexeddb'
import App from '../App'
import { createProposalRepository } from '../storage/proposalRepository'
import { demoProposal } from '../data/demoProposal'

describe('local library workflow', () => {
  it('starts empty, creates a default, flushes edits on back and restores after remount', async () => {
    const repository = createProposalRepository(new IDBFactory())
    const user = userEvent.setup()
    const view = render(<App repository={repository} />)
    expect(await screen.findByText('Chưa có báo giá')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Tạo báo giá mới' }))
    const bride = await screen.findByLabelText('Bride name')
    expect(bride).toHaveValue('')
    fireEvent.change(bride, { target: { value: 'Ánh' } })
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Đà Lạt' } })
    await user.click(screen.getByRole('button', { name: '← Báo giá' }))
    expect(await screen.findByRole('button', { name: 'Mở báo giá Ánh' })).toBeInTheDocument()
    view.unmount()
    render(<App repository={repository} />)
    await user.click(await screen.findByRole('button', { name: 'Mở báo giá Ánh' }))
    expect(await screen.findByLabelText('Location')).toHaveValue('Đà Lạt')
    expect(screen.getByLabelText('Bride name')).toHaveValue('Ánh')
  })
  it('searches names/location, duplicates, cancels and confirms deletion', async () => {
    const repository = createProposalRepository(new IDBFactory())
    await repository.save(demoProposal, null)
    render(<App repository={repository} />)
    const user = userEvent.setup()
    await screen.findByRole('button', { name: 'Mở báo giá Ngọc & Huy' })
    const search = screen.getByLabelText('Tìm báo giá')
    fireEvent.change(search, { target: { value: 'trà vinh' } })
    expect(screen.getByRole('button', { name: 'Mở báo giá Ngọc & Huy' })).toBeInTheDocument()
    fireEvent.change(search, { target: { value: 'không có' } })
    expect(screen.getByText('Không tìm thấy báo giá')).toBeInTheDocument()
    fireEvent.change(search, { target: { value: '' } })
    await user.click(screen.getByRole('button', { name: 'Nhân bản Ngọc & Huy' }))
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Mở báo giá Ngọc & Huy' })).toHaveLength(2))
    await user.click(screen.getAllByRole('button', { name: 'Xóa Ngọc & Huy' })[0])
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Hủy' }))
    expect(screen.getAllByRole('button', { name: 'Mở báo giá Ngọc & Huy' })).toHaveLength(2)
    await user.click(screen.getAllByRole('button', { name: 'Xóa Ngọc & Huy' })[0])
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }))
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Mở báo giá Ngọc & Huy' })).toHaveLength(1))
  })
  it('warns when storage unavailable and allows memory editing without claiming saved', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const repository = { ...createProposalRepository(new IDBFactory()), list: async () => { throw new Error('unavailable') } }
    render(<App repository={repository} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể lưu dữ liệu trên thiết bị này.')
    await userEvent.click(screen.getByRole('button', { name: '+ Tạo báo giá mới' }))
    expect(await screen.findByLabelText('Bride name')).toHaveValue('')
    expect(screen.queryByText('Đã lưu')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Bride name'), { target: { value: 'Linh' } })
    expect(screen.getByTestId('cover-couple')).toHaveTextContent('LINH')
    error.mockRestore()
  })
  it('shows signed totals consistently with the Proposal preview', async () => {
    const repository = createProposalRepository(new IDBFactory())
    await repository.save({ ...demoProposal, events: [], adjustments: [{ id: 'discount', name: 'Ưu đãi', amount: -500000 }] }, null)
    render(<App repository={repository} />)
    expect(await screen.findByText('−500.000 VND')).toBeInTheDocument()
  })
  it('keeps dirty Editor on write failure and retries before returning to Library', async () => {
    const repository = createProposalRepository(new IDBFactory())
    await repository.save(demoProposal, null)
    let fail = true
    const flaky = { ...repository, save: async (...args: Parameters<typeof repository.save>) => {
      if (fail) throw new Error('quota')
      return repository.save(...args)
    } }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<App repository={flaky} />)
    await userEvent.click(await screen.findByRole('button', { name: 'Mở báo giá Ngọc & Huy' }))
    fireEvent.change(await screen.findByLabelText('Bride name'), { target: { value: 'Linh' } })
    await userEvent.click(screen.getByRole('button', { name: '← Báo giá' }))
    expect(await screen.findByText('Không thể lưu')).toBeInTheDocument()
    expect(screen.getByLabelText('Bride name')).toHaveValue('Linh')
    expect((await repository.load(demoProposal.id))?.proposal.couple.brideName).toBe('Ngọc')
    fail = false
    await userEvent.click(screen.getByRole('button', { name: '← Báo giá' }))
    expect(await screen.findByRole('button', { name: 'Mở báo giá Linh & Huy' })).toBeInTheDocument()
    log.mockRestore()
  })
})
