import { useEffect, useId, useRef, useState } from 'react'
import { ExportSizeError, type ExportFormat, type ExportOptions, type ExportQuality } from './exportOptions'
import { ExportDiagnosticError } from './ExportDiagnosticError'

export function ExportControl({ onExport }: { onExport: (options: ExportOptions) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'exporting' | 'success'>('idle')
  const [format, setFormat] = useState<ExportFormat>('jpg')
  const [quality, setQuality] = useState<ExportQuality>('standard')
  const [error, setError] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const locked = useRef(false)
  const restoreFocus = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = useId()
  const busy = status === 'exporting'
  useEffect(() => {
    if (open) { dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input:checked')?.focus() }
  }, [open])
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!open && !busy && restoreFocus.current) { trigger.current?.focus(); restoreFocus.current = false }
  }, [open, busy])
  const close = () => { restoreFocus.current = true; dialog.current?.close(); setOpen(false) }
  const run = async () => {
    if (locked.current) return
    locked.current = true; setStatus('exporting'); setError(''); clearTimeout(timer.current)
    try {
      await onExport({ format, quality })
      setStatus('success'); close()
      timer.current = setTimeout(() => setStatus('idle'), 3000)
    } catch (cause) {
      console.error('Proposal export failed', cause)
      setError(cause instanceof ExportSizeError ? cause.message
        : cause instanceof ExportDiagnosticError ? `Không thể xuất báo giá. Mã lỗi: ${cause.code}. Vui lòng thử lại.`
        : 'Không thể xuất báo giá. Vui lòng thử lại.')
      setStatus('idle')
    } finally { locked.current = false }
  }
  return <div className="export-control">
    <button ref={trigger} type="button" className="export-primary" disabled={busy} aria-haspopup="dialog" aria-expanded={open}
      onClick={() => { setFormat('jpg'); setQuality('standard'); setError(''); setOpen(true) }}>
      {busy ? 'ĐANG XUẤT...' : status === 'success' ? 'ĐÃ XUẤT' : 'XUẤT BÁO GIÁ'}
    </button>
    <span className="export-sr-only" role="status">{busy ? 'Đang xuất báo giá' : status === 'success' ? 'Đã xuất báo giá' : ''}</span>
    {open && <dialog ref={dialog} className="export-dialog" aria-labelledby={`${id}-title`} aria-busy={busy}
      onCancel={event => { event.preventDefault(); if (!locked.current) close() }}>
      <form onSubmit={event => { event.preventDefault(); void run() }}>
        <h2 id={`${id}-title`}>XUẤT BÁO GIÁ</h2>
        <fieldset disabled={busy}>
          <legend>Định dạng</legend>
          <label><input type="radio" name={`${id}-format`} checked={format === 'jpg'} onChange={() => setFormat('jpg')} /> JPG</label>
          <label><input type="radio" name={`${id}-format`} checked={format === 'png'} onChange={() => setFormat('png')} /> PNG</label>
        </fieldset>
        <fieldset disabled={busy}>
          <legend>Chất lượng</legend>
          <label><input type="radio" name={`${id}-quality`} checked={quality === 'standard'} onChange={() => setQuality('standard')} /> Tiêu chuẩn — 1080px</label>
          <label><input type="radio" name={`${id}-quality`} checked={quality === 'high'} onChange={() => setQuality('high')} /> Chất lượng cao — 1440px</label>
        </fieldset>
        {error && <p className="export-error" role="alert">{error}</p>}
        <div className="export-actions">
          <button type="button" className="export-cancel" disabled={busy} onClick={close}>HỦY</button>
          <button type="submit" className="export-primary" disabled={busy}>{busy ? 'ĐANG XUẤT...' : 'XUẤT FILE'}</button>
        </div>
      </form>
    </dialog>}
  </div>
}
