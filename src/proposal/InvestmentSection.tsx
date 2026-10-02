import type { Proposal } from '../types/proposal'
import { calculateTotal, formatCurrency } from '../utils/currency'

export function InvestmentSection({ proposal }: { proposal: Proposal }) {
  return (
    <section className="proposal-investment" aria-label="Total investment">
      <p className="document-label">Tổng chi phí</p>
      <strong data-testid="total-investment"><span>{formatCurrency(calculateTotal(proposal.events))}</span>{' '}<small>VND</small></strong>
    </section>
  )
}
