import { StrictMode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { demoProposal } from '../data/demoProposal'
import { createMemoryRepository } from '../storage/proposalRepository'
import { PersistedEditorSession } from './PersistedEditorSession'

describe('persisted Hero session', () => {
  it('restores crop with a runtime URL and releases every owned URL on close, including StrictMode', async () => {
    const created: string[] = [], released: string[] = []
    vi.stubGlobal('URL', Object.assign(class extends URL {}, {
      createObjectURL: () => { const url = `blob:restored-${created.length}`; created.push(url); return url },
      revokeObjectURL: (url: string) => released.push(url),
    }))
    const repository = createMemoryRepository()
    await repository.save({ ...demoProposal, heroImage: { src: 'blob:old-session', positionX: 23, positionY: 67, zoom: 1.8 } }, new Blob(['original']))
    const draft = (await repository.load(demoProposal.id))!
    const before = draft.record.updatedAt
    const view = render(<StrictMode><PersistedEditorSession draft={draft} repository={repository} volatile={false} onBack={() => {}} /></StrictMode>)
    expect(await screen.findByRole('slider', { name: 'Zoom' })).toHaveValue('1.8')
    const active = screen.getByAltText('Ảnh Hero đang chỉnh').getAttribute('src')!
    expect(active).toMatch(/^blob:restored-/)
    fireEvent.click(view.container.querySelector('summary[aria-label="Hero Image"]')!)
    await userEvent.click(screen.getByRole('button', { name: 'Xem trước' }))
    expect(released).not.toContain(active)
    await userEvent.click(screen.getByRole('button', { name: '← Báo giá' }))
    expect((await repository.load(demoProposal.id))?.record.updatedAt).toBe(before)
    await userEvent.click(screen.getByRole('button', { name: 'Chỉnh sửa' }))
    fireEvent.click(view.container.querySelector('summary[aria-label="Hero Image"]')!)
    await userEvent.click(screen.getByRole('button', { name: 'Xóa ảnh' }))
    expect(released).toContain(active)
    expect(screen.getByAltText('Ảnh Hero đang chỉnh').getAttribute('src')).not.toBe(active)
    view.unmount()
    expect([...released].sort()).toEqual([...created].sort())
    vi.unstubAllGlobals()
  })
  it('flushes on pagehide without waiting for debounce', async () => {
    const repository = createMemoryRepository()
    await repository.save(demoProposal, null)
    const draft = (await repository.load(demoProposal.id))!
    render(<PersistedEditorSession draft={draft} repository={repository} volatile={false} onBack={() => {}} />)
    fireEvent.change(await screen.findByLabelText('Bride name'), { target: { value: 'Linh' } })
    fireEvent(window, new Event('pagehide'))
    await waitFor(async () => expect((await repository.load(demoProposal.id))?.proposal.couple.brideName).toBe('Linh'))
    expect(screen.getByText('Đã lưu')).toBeInTheDocument()
  })
})
