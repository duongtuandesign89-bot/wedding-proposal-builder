import { useEffect, useRef, useState } from 'react'
import type { SavedProposal } from '../storage/proposalRepository'
import { filterProposals } from '../storage/proposalRepository'
import { getProposalDisplayName } from '../utils/proposalDisplayName'
import { calculateProposalTotal, formatProposalTotal } from '../utils/currency'

export function ProposalLibrary({ records, loading, busy, warning, error, onCreate, onOpen, onDuplicate, onDelete }: {
  records: SavedProposal[]; loading: boolean; busy: boolean; warning: boolean; error: string;
  onCreate: () => void; onOpen: (id: string) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => Promise<boolean>
}) {
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<SavedProposal | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (deleting) {
      previousFocus.current = document.activeElement as HTMLElement
      if (dialog.current && !dialog.current.open) dialog.current.showModal?.()
      cancel.current?.focus()
    } else previousFocus.current?.focus()
  }, [deleting])
  const visible = filterProposals(records, search)
  return <main className="proposal-library">
    <div className="library-inner">
      <header className="library-header"><div><p className="library-brand">Solis Studio</p><h1>Báo giá</h1><p className="library-subtitle">Báo giá của bạn, lưu trên thiết bị này.</p></div>
        <button type="button" className="library-primary" disabled={busy || loading} onClick={onCreate}>+ Tạo báo giá mới</button>
      </header>
      {warning && <p className="storage-warning" role="alert">Không thể lưu dữ liệu trên thiết bị này. Dữ liệu chỉ tồn tại trong phiên đang mở.</p>}
      {error && <p className="library-error" role="alert">{error}</p>}
      <div className="library-toolbar"><label className="library-search"><span>Tìm báo giá</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên cô dâu, chú rể hoặc địa điểm" /></label><span>{records.length} báo giá</span></div>
      {loading ? <p role="status" className="library-empty">Đang mở thư viện…</p> : records.length === 0 ? <section className="library-empty"><h2>Chưa có báo giá</h2><p>Tạo báo giá đầu tiên để bắt đầu.</p></section> : visible.length === 0 ? <p className="library-empty">Không tìm thấy báo giá</p> : <ul className="library-list">
        {visible.map(record => {
          const p = record.proposal, name = getProposalDisplayName(p, 'library')
          return <li className="library-row" key={record.id}>
            <button type="button" className="library-open" aria-label={`Mở báo giá ${name}`} disabled={busy} onClick={() => onOpen(record.id)}>
              <h2>{name}</h2><p>{[p.weddingDate, p.location].filter(Boolean).join(' · ') || 'Chưa có ngày và địa điểm'}</p>
              <span className="library-updated">Cập nhật: {new Date(record.updatedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </button>
            <div className="library-row-side"><strong>{formatProposalTotal(calculateProposalTotal(p))} VND</strong><div className="library-actions">
              <button type="button" disabled={busy} aria-label={`Nhân bản ${name}`} onClick={() => onDuplicate(record.id)}>Nhân bản</button>
              <button type="button" disabled={busy} aria-label={`Xóa ${name}`} onClick={() => setDeleting(record)}>Xóa</button>
            </div></div>
          </li>
        })}
      </ul>}
    </div>
    {deleting && <dialog ref={dialog} open={typeof HTMLDialogElement.prototype.showModal !== 'function' ? true : undefined} role="alertdialog" className="library-dialog" aria-labelledby="library-delete-title" aria-describedby="library-delete-description"
      onCancel={event => { event.preventDefault(); if (!busy) setDeleting(null) }}
      onKeyDown={event => {
        if (event.key === 'Escape' && !busy) { event.preventDefault(); setDeleting(null) }
        if (event.key === 'Tab') {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
          const first = buttons[0], last = buttons.at(-1)
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }
      }}>
      <h2 id="library-delete-title">Xóa báo giá của {getProposalDisplayName(deleting.proposal, 'library')}?</h2>
      <p id="library-delete-description">Báo giá và ảnh riêng của báo giá này sẽ bị xóa khỏi thiết bị.</p>
      <div className="library-actions"><button ref={cancel} type="button" disabled={busy} onClick={() => setDeleting(null)}>Hủy</button><button type="button" disabled={busy} onClick={() => { void onDelete(deleting.id).then(success => { if (success) setDeleting(null) }) }}>Xóa</button></div>
    </dialog>}
  </main>
}
