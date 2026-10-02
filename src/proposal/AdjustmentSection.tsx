import type { Adjustment } from '../types/proposal'
import { formatSignedCurrency } from '../utils/currency'

export function AdjustmentSection({ adjustments }: { adjustments: Adjustment[] }) {
  if (!adjustments.length) return null
  return <section className="proposal-adjustments" aria-label="Phí & điều chỉnh">
    <h2 className="document-label services-heading">Phí &amp; điều chỉnh</h2>
    <dl className="adjustment-services">
      {adjustments.map(item => <div className="event-service" key={item.id}>
        <dt><strong>{item.name}</strong></dt><dd>{formatSignedCurrency(item.amount)}</dd>
      </div>)}
    </dl>
  </section>
}
