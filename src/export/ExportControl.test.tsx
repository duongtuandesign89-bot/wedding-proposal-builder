import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ExportControl } from './ExportControl'
import { ExportSizeError } from './exportOptions'
import { ExportDiagnosticError } from './ExportDiagnosticError'

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks() })
it('opens options without exporting, defaults JPG/standard, and allows cancel', () => {
  const run = vi.fn(async () => {})
  render(<ExportControl onExport={run} />)
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' }))
  expect(screen.getByRole('radio', { name: 'JPG' })).toBeChecked()
  expect(screen.getByRole('radio', { name: 'Tiêu chuẩn — 1080px' })).toBeChecked()
  expect(run).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'HỦY' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
it('passes selected format/preset, prevents duplicate export and resets success feedback', async () => {
  let done!: () => void
  const run = vi.fn(() => new Promise<void>(resolve => { done = resolve }))
  render(<ExportControl onExport={run} />)
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' }))
  fireEvent.click(screen.getByRole('radio', { name: 'PNG' }))
  fireEvent.click(screen.getByRole('radio', { name: 'Chất lượng cao — 1440px' }))
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT FILE' }))
  expect(screen.getAllByRole('button', { name: 'ĐANG XUẤT...' }).every(button => button.hasAttribute('disabled'))).toBe(true)
  fireEvent.submit(screen.getByRole('dialog').querySelector('form')!)
  expect(run).toHaveBeenCalledTimes(1)
  expect(run).toHaveBeenCalledWith({ format: 'png', quality: 'high' })
  vi.useFakeTimers()
  await act(async () => done())
  expect(screen.getByRole('button', { name: 'ĐÃ XUẤT' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'ĐÃ XUẤT' })).toHaveFocus()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  act(() => vi.advanceTimersByTime(3000))
  expect(screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' })).toBeEnabled()
})
it.each([new Error('capture error'), new ExportSizeError()])('recovers from export errors and permits retry', async error => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const run = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce(undefined)
  render(<ExportControl onExport={run} />)
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' }))
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT FILE' }))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(error instanceof ExportSizeError ? 'Báo giá quá dài' : 'Không thể xuất báo giá. Vui lòng thử lại.'))
  expect(screen.getByRole('button', { name: 'XUẤT FILE' })).toBeEnabled()
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT FILE' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'ĐÃ XUẤT' })).toBeInTheDocument())
})
it('Escape cancels and returns focus to the trigger', () => {
  render(<ExportControl onExport={async () => {}} />)
  const trigger = screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' })
  fireEvent.click(trigger)
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true, cancelable: true }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})
it('shows a safe diagnostic code instead of exposing an underlying image URL', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const run = async () => { throw new ExportDiagnosticError('PREPARE', new Error('Export image failed: blob:private-client-image')) }
  render(<ExportControl onExport={run} />)
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT BÁO GIÁ' }))
  fireEvent.click(screen.getByRole('button', { name: 'XUẤT FILE' }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('PREPARE-IMAGE')
  expect(alert).not.toHaveTextContent('private-client-image')
  expect(screen.getByRole('button', { name: 'XUẤT FILE' })).toBeEnabled()
})
