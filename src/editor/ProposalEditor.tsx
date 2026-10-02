import type { Couple, Proposal, ServiceItem, WeddingEvent } from '../types/proposal'
import { formatCurrency, parseCurrencyInput } from '../utils/currency'
import { EditorField } from './EditorField'

interface ProposalEditorProps {
  proposal: Proposal
  onCoupleChange: (field: keyof Couple, value: string) => void
  onGeneralChange: (field: 'title' | 'weddingDate' | 'location', value: string) => void
  onEventChange: (eventId: string, field: keyof Omit<WeddingEvent, 'id' | 'services'>, value: string) => void
  onServiceChange: (eventId: string, serviceId: string, field: keyof Pick<ServiceItem, 'name' | 'price'>, value: string | number) => void
}

export function ProposalEditor({
  proposal,
  onCoupleChange,
  onGeneralChange,
  onEventChange,
  onServiceChange,
}: ProposalEditorProps) {
  return (
    <aside className="proposal-editor" aria-label="Proposal editor">
      <header className="editor-header">
        <div className="editor-brand-mark">S</div>
        <div>
          <p>Solis Studio</p>
          <h1>Proposal Editor</h1>
        </div>
        <span className="editor-status">Live</span>
      </header>

      <div className="editor-content">
        <section className="editor-section">
          <div className="editor-section-heading"><span>01</span><h2>Couple</h2></div>
          <div className="editor-grid editor-grid--two">
            <EditorField label="Bride name" value={proposal.couple.brideName} onChange={(event) => onCoupleChange('brideName', event.target.value)} />
            <EditorField label="Groom name" value={proposal.couple.groomName} onChange={(event) => onCoupleChange('groomName', event.target.value)} />
          </div>
        </section>

        <section className="editor-section">
          <div className="editor-section-heading"><span>02</span><h2>General</h2></div>
          <div className="editor-grid">
            <EditorField label="Proposal title" value={proposal.title} onChange={(event) => onGeneralChange('title', event.target.value)} />
            <EditorField label="Wedding date" value={proposal.weddingDate} onChange={(event) => onGeneralChange('weddingDate', event.target.value)} />
            <EditorField label="Location" value={proposal.location} onChange={(event) => onGeneralChange('location', event.target.value)} />
          </div>
        </section>

        <section className="editor-section">
          <div className="editor-section-heading"><span>03</span><h2>Wedding Events</h2></div>
          <div className="event-editors">
            {proposal.events.map((weddingEvent, eventIndex) => (
              <article className="event-editor" key={weddingEvent.id}>
                <div className="event-editor-title">
                  <span>{String(eventIndex + 1).padStart(2, '0')}</span>
                  <strong>{weddingEvent.name || 'Untitled event'}</strong>
                </div>
                <div className="editor-grid editor-grid--two">
                  <EditorField label={`Event ${eventIndex + 1} name`} value={weddingEvent.name} onChange={(event) => onEventChange(weddingEvent.id, 'name', event.target.value)} />
                  <EditorField label={`Event ${eventIndex + 1} date`} value={weddingEvent.date} onChange={(event) => onEventChange(weddingEvent.id, 'date', event.target.value)} />
                  <EditorField label={`Event ${eventIndex + 1} start time`} value={weddingEvent.startTime} onChange={(event) => onEventChange(weddingEvent.id, 'startTime', event.target.value)} />
                  <EditorField label={`Event ${eventIndex + 1} end time`} value={weddingEvent.endTime} onChange={(event) => onEventChange(weddingEvent.id, 'endTime', event.target.value)} />
                </div>
                <EditorField label={`Event ${eventIndex + 1} location`} value={weddingEvent.location} onChange={(event) => onEventChange(weddingEvent.id, 'location', event.target.value)} />

                <div className="service-editor-list">
                  <p className="service-editor-label">Services</p>
                  {weddingEvent.services.map((service) => (
                    <div className="service-editor-row" key={service.id}>
                      <EditorField label={`${service.name} name for ${weddingEvent.name}`} value={service.name} onChange={(event) => onServiceChange(weddingEvent.id, service.id, 'name', event.target.value)} />
                      <EditorField label={`${service.name} price for ${weddingEvent.name}`} value={formatCurrency(service.price)} inputMode="numeric" onChange={(event) => onServiceChange(weddingEvent.id, service.id, 'price', parseCurrencyInput(event.target.value))} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}
