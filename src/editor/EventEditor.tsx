import { useEffect, useRef, useState } from 'react'
import type { WeddingEvent } from '../types/proposal'
import type { ProposalEditorActions } from './useProposalEditor'
import { EditorField } from './EditorField'
import { AmountField } from './AmountField'

export function EventEditor({ event, index, count, actions }: {
  event: WeddingEvent; index: number; count: number; actions: ProposalEditorActions
}) {
  const [expanded, setExpanded] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [focusId, setFocusId] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (focusId) { nameRef.current?.focus(); setFocusId(null) } }, [focusId])
  useEffect(() => { if (confirming) cancelRef.current?.focus() }, [confirming])
  const label = event.name || 'Sự kiện chưa đặt tên'
  const cancel = () => { setConfirming(false); deleteRef.current?.focus() }
  return <article className="event-editor" aria-label={`Chỉnh sửa ${label}`}>
    <div className="event-editor-title"><span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong></div>
    <div className="event-editor-actions">
      <button type="button" className="editor-action" aria-label={`${expanded ? 'Thu gọn' : 'Mở rộng'} ${label}`} aria-expanded={expanded} aria-controls={`event-fields-${event.id}`} onClick={() => setExpanded(!expanded)}>{expanded ? 'Thu gọn' : 'Mở rộng'}</button>
      <button type="button" className="editor-action editor-action--arrow" aria-label={`Di chuyển lên ${label}`} disabled={index === 0} onClick={() => actions.moveEvent(event.id, -1)}>↑</button>
      <button type="button" className="editor-action editor-action--arrow" aria-label={`Di chuyển xuống ${label}`} disabled={index === count - 1} onClick={() => actions.moveEvent(event.id, 1)}>↓</button>
      <button ref={deleteRef} type="button" className="editor-action" aria-label={`Xóa sự kiện ${label}`} onClick={() => setConfirming(true)}>Xóa sự kiện</button>
    </div>
    {confirming && <div className="editor-delete-confirm" role="group" aria-label={`Xác nhận xóa ${label}`} onKeyDown={event => { if (event.key === 'Escape') cancel() }}>
      <p>Xóa sự kiện này?</p>
      <button ref={cancelRef} type="button" className="editor-action" onClick={cancel}>Hủy</button>
      <button type="button" className="editor-action editor-action--danger" onClick={() => actions.removeEvent(event.id)}>Xóa</button>
    </div>}
    {!expanded && <div className="event-editor-summary">{event.date && <span>{event.date}</span>}{event.location && <span>{event.location}</span>}</div>}
    {expanded && <div id={`event-fields-${event.id}`} className="event-editor-fields">
      <div className="editor-grid editor-grid--two">
        <EditorField label={`Event ${index + 1} name`} value={event.name} onChange={e => actions.updateEvent(event.id, { name: e.target.value })} />
        <EditorField label={`Event ${index + 1} date`} value={event.date} onChange={e => actions.updateEvent(event.id, { date: e.target.value })} />
        <EditorField label={`Event ${index + 1} start time`} value={event.startTime} onChange={e => actions.updateEvent(event.id, { startTime: e.target.value })} />
        <EditorField label={`Event ${index + 1} end time`} value={event.endTime} onChange={e => actions.updateEvent(event.id, { endTime: e.target.value })} />
      </div>
      <EditorField label={`Event ${index + 1} location`} value={event.location} onChange={e => actions.updateEvent(event.id, { location: e.target.value })} />
      <div className="service-editor-list">
        <p className="service-editor-label">Services</p>
        {event.services.map(service => <div className="service-editor-item" key={service.id}>
          <div className="service-editor-row">
            <EditorField label={`${service.name} name for ${event.name}`} value={service.name} inputRef={service.id === focusId ? nameRef : undefined} onChange={e => actions.updateService(event.id, service.id, { name: e.target.value })} />
            <AmountField label={`${service.name} price for ${event.name}`} value={service.price} onChange={price => actions.updateService(event.id, service.id, { price })} />
          </div>
          <EditorField label={`${service.name} description for ${event.name}`} value={service.description ?? ''} onChange={e => actions.updateService(event.id, service.id, { description: e.target.value })} />
          <button type="button" className="editor-action" aria-label={`Xóa dịch vụ ${service.name} trong ${event.name}`} onClick={() => actions.removeService(event.id, service.id)}>Xóa dịch vụ</button>
        </div>)}
        <button type="button" className="editor-add" aria-label={`Thêm dịch vụ cho ${label}`} onClick={() => setFocusId(actions.addService(event.id))}>+ Thêm dịch vụ</button>
      </div>
    </div>}
  </article>
}
