import type { Proposal } from '../types/proposal'
import { HeroSection } from './HeroSection'
import { EventSection } from './EventSection'
import { InvestmentSection } from './InvestmentSection'
import { TermsSection } from './TermsSection'
import { FooterSection } from './FooterSection'

export const PROPOSAL_DESIGN_WIDTH = 1080

export function ProposalDocument({ proposal }: { proposal: Proposal }) {
  return (
    <article id="proposal-document" aria-label="Wedding proposal">
      <HeroSection proposal={proposal} />
      <div className="document-events">
        <h2 className="document-label services-heading">Chi tiết dịch vụ</h2>
        {proposal.events.map((event, index) => <EventSection key={event.id} event={event} index={index} />)}
      </div>
      <InvestmentSection proposal={proposal} />
      <TermsSection notes={proposal.notes} />
      <FooterSection studioName={proposal.settings.studioName} />
    </article>
  )
}
