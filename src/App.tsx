import { useState } from 'react'
import { demoProposal } from './data/demoProposal'
import { ProposalEditor } from './editor/ProposalEditor'
import { ProposalPreview } from './proposal/ProposalPreview'
import type { Couple, Proposal, ServiceItem, WeddingEvent } from './types/proposal'

type MobileView = 'editor' | 'preview'

export default function App() {
  const [proposal, setProposal] = useState<Proposal>(demoProposal)
  const [mobileView, setMobileView] = useState<MobileView>('editor')

  const updateCouple = (field: keyof Couple, value: string) => {
    setProposal((current) => ({
      ...current,
      couple: { ...current.couple, [field]: value },
    }))
  }

  const updateGeneral = (field: 'title' | 'weddingDate' | 'location', value: string) => {
    setProposal((current) => ({ ...current, [field]: value }))
  }

  const updateEvent = (
    eventId: string,
    field: keyof Omit<WeddingEvent, 'id' | 'services'>,
    value: string,
  ) => {
    setProposal((current) => ({
      ...current,
      events: current.events.map((event) =>
        event.id === eventId ? { ...event, [field]: value } : event,
      ),
    }))
  }

  const updateService = (
    eventId: string,
    serviceId: string,
    field: keyof Pick<ServiceItem, 'name' | 'price'>,
    value: string | number,
  ) => {
    setProposal((current) => ({
      ...current,
      events: current.events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              services: event.services.map((service) =>
                service.id === serviceId ? { ...service, [field]: value } : service,
              ),
            }
          : event,
      ),
    }))
  }

  return (
    <div className={`app-shell app-shell--${mobileView}`}>
      <nav className="mobile-mode-switch" aria-label="View mode">
        <button type="button" className={mobileView === 'editor' ? 'is-active' : ''} aria-pressed={mobileView === 'editor'} onClick={() => setMobileView('editor')}>Chỉnh sửa</button>
        <button type="button" className={mobileView === 'preview' ? 'is-active' : ''} aria-pressed={mobileView === 'preview'} onClick={() => setMobileView('preview')}>Xem trước</button>
      </nav>
      <ProposalEditor proposal={proposal} onCoupleChange={updateCouple} onGeneralChange={updateGeneral} onEventChange={updateEvent} onServiceChange={updateService} />
      <ProposalPreview proposal={proposal} />
    </div>
  )
}
