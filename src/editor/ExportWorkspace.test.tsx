import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { demoProposal } from '../data/demoProposal'
import { createMemoryRepository } from '../storage/proposalRepository'
import { EditorWorkspace } from './EditorWorkspace'

const capture = vi.hoisted(() => vi.fn(async (_proposal: typeof demoProposal, _options: unknown, _image: unknown) => {}))
vi.mock('../export/exportProposal', () => ({ exportProposal: capture }))
afterEach(() => { cleanup(); vi.restoreAllMocks(); capture.mockClear() })
it('flushes pending autosave and exports current in-memory draft without an extra save', async () => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
  const repository = createMemoryRepository()
  await repository.save(demoProposal, null)
  const save = vi.spyOn(repository, 'save')
  render(<EditorWorkspace initialProposal={demoProposal} repository={repository} />)
  fireEvent.change(screen.getByLabelText('Bride name'), { target: { value: 'Ánh' } })
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' }))
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT FILE' }))
  await waitFor(() => expect(capture).toHaveBeenCalledOnce())
  expect(capture.mock.calls[0][0].couple.brideName).toBe('Ánh')
  expect((await repository.load(demoProposal.id))!.proposal.couple.brideName).toBe('Ánh')
  expect(save).toHaveBeenCalledOnce()
  const updatedAt = (await repository.list())[0].updatedAt
  fireEvent.click(screen.getByRole('button', { name: 'ĐÃ XUẤT' }))
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT FILE' }))
  await waitFor(() => expect(capture).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenCalledOnce()
  expect((await repository.list())[0].updatedAt).toBe(updatedAt)
})
