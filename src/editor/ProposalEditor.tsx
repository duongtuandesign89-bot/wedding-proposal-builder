import type { Proposal } from '../types/proposal'
import type { ProposalEditorActions } from './useProposalEditor'
import { EditorField } from './EditorField'
import { EventEditor } from './EventEditor'
import { AmountField } from './AmountField'
import { HeroImageEditor } from './HeroImageEditor'
import { EditorGroup } from './EditorGroup'
import { ContentEditor } from './ContentEditor'

export function ProposalEditor({ proposal, actions }: { proposal: Proposal; actions: ProposalEditorActions }) {
  return <aside className="proposal-editor" aria-label="Proposal editor">
    <header className="editor-header">
      <div className="editor-brand-mark">S</div>
      <div><p>Solis Studio</p><h1>Proposal Editor</h1></div>
      <span className="editor-status">Live</span>
    </header>
    <div className="editor-content">
      <section className="editor-section">
        <div className="editor-section-heading"><span>01</span><h2>Couple</h2></div>
        <div className="editor-grid editor-grid--two">
          <EditorField label="Bride name" value={proposal.couple.brideName} onChange={e => actions.updateCouple('brideName', e.target.value)} />
          <EditorField label="Groom name" value={proposal.couple.groomName} onChange={e => actions.updateCouple('groomName', e.target.value)} />
        </div>
      </section>
      <section className="editor-section">
        <div className="editor-section-heading"><span>02</span><h2>General</h2></div>
        <div className="editor-grid">
          <EditorField label="Proposal title" value={proposal.title} onChange={e => actions.updateGeneral('title', e.target.value)} />
          <EditorField label="Wedding date" value={proposal.weddingDate} onChange={e => actions.updateGeneral('weddingDate', e.target.value)} />
          <EditorField label="Location" value={proposal.location} onChange={e => actions.updateGeneral('location', e.target.value)} />
        </div>
      </section>
      <EditorGroup number="03" title="Wedding Events">
        <div className="event-editors">
          {proposal.events.map((event, index) => <EventEditor key={event.id} event={event} index={index} count={proposal.events.length} actions={actions} />)}
        </div>
        <button type="button" className="editor-add" onClick={actions.addEvent}>+ Thêm sự kiện</button>
      </EditorGroup>
      <EditorGroup number="04" title="Điều chỉnh chi phí">
        <p className="editor-help">Số dương cho phụ phí, số âm cho ưu đãi hoặc giảm giá.</p>
        <div className="adjustment-editor-list">
          {proposal.adjustments.map((item, index) => <div className="adjustment-editor-item" key={item.id}>
            <div className="service-editor-row">
              <EditorField label={`Adjustment ${index + 1} name`} value={item.name} onChange={e => actions.updateAdjustment(item.id, { name: e.target.value })} />
              <AmountField label={`Adjustment ${index + 1} amount`} value={item.amount} signed onChange={amount => actions.updateAdjustment(item.id, { amount })} />
            </div>
            <button type="button" className="editor-action" aria-label={`Xóa điều chỉnh ${item.name}`} onClick={() => actions.removeAdjustment(item.id)}>Xóa điều chỉnh</button>
          </div>)}
        </div>
        <button type="button" className="editor-add" onClick={actions.addAdjustment}>+ Thêm điều chỉnh</button>
      </EditorGroup>
      <HeroImageEditor image={proposal.heroImage} onChange={actions.updateHeroImage} />
      <ContentEditor proposal={proposal} actions={actions} />
    </div>
  </aside>
}
