import type { WeddingEvent } from '../types/proposal'
import { formatCurrency } from '../utils/currency'

export function EventSection({ event, index }: { event: WeddingEvent; index: number }) {
  return (
    <section className="proposal-event" aria-label={event.name}>
      <header className="event-heading">
        <span className="event-number">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>{event.name.toLocaleUpperCase('vi-VN')}</h3>
          <p className="event-date">{event.date}</p>
          <div className="event-meta"><span>{event.location}</span><span>{event.startTime} — {event.endTime}</span></div>
        </div>
      </header>
      <dl className="event-services">
        {event.services.map((service) => (
          <div className="event-service" key={service.id}>
            <dt><strong>{service.name}</strong></dt>
            <dd>{formatCurrency(service.price)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
