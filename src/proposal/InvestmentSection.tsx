import type { Proposal } from '../types/proposal'
import { calculateProposalTotal, formatProposalTotal } from '../utils/currency'

export function InvestmentSection({ proposal }: { proposal: Proposal }) {
  return (
    <section className="proposal-investment" aria-label="Total investment">
      <p className="document-label">Tổng chi phí</p>
      <strong data-testid="total-investment"><span>{formatProposalTotal(calculateProposalTotal(proposal))}</span>{' '}<small>VND</small></strong>
    </section>
  )
}
