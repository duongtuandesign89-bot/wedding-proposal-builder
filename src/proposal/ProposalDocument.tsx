import type { Proposal } from '../types/proposal'
import { HeroSection } from './HeroSection'
import { EventSection } from './EventSection'
import { InvestmentSection } from './InvestmentSection'
import { IntroductionSection } from './IntroductionSection'
import { EditorialListSection } from './EditorialListSection'
import { FooterSection } from './FooterSection'
import { AdjustmentSection } from './AdjustmentSection'

export const PROPOSAL_DESIGN_WIDTH = 1080

export function ProposalDocument({ proposal, mode = 'preview' }: { proposal: Proposal; mode?: 'preview' | 'export' }) {
  return (
    <article id={mode === 'export' ? 'proposal-export-document' : 'proposal-document'} data-export-mode={mode === 'export' ? 'true' : undefined} aria-label="Wedding proposal">
      <HeroSection proposal={proposal} />
      <IntroductionSection introduction={proposal.introduction} />
      {proposal.events.length > 0 && <div className="document-events">
        <h2 className="document-label services-heading">Chi tiết dịch vụ</h2>
        {proposal.events.map((event, index) => <EventSection key={event.id} event={event} index={index} />)}
      </div>}
      <AdjustmentSection adjustments={proposal.adjustments} />
      <InvestmentSection proposal={proposal} />
      <EditorialListSection content={proposal.notes} kind="notes" />
      <EditorialListSection content={proposal.terms} kind="terms" />
      <FooterSection contact={proposal.contact} />
    </article>
  )
}
