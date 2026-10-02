import type { WeddingEvent } from '../types/proposal'
import { formatCurrency } from '../utils/currency'

export function EventSection({ event, index }: { event: WeddingEvent; index: number }) {
  const time = [event.startTime, event.endTime].filter(Boolean).join(' — ')
  return (
    <section className="proposal-event" aria-label={event.name}>
      <header className="event-heading">
        <span className="event-number">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3>{event.name.toLocaleUpperCase('vi-VN')}</h3>
          {event.date && <p className="event-date">{event.date}</p>}
          {(event.location || time) && <div className="event-meta">{event.location && <span>{event.location}</span>}{time && <span>{time}</span>}</div>}
        </div>
      </header>
      {event.services.length > 0 && <dl className="event-services">
        {event.services.map((service) => (
          <div className="event-service" key={service.id}>
            <dt><strong>{service.name}</strong>{service.description?.trim() && <p className="service-description">{service.description}</p>}</dt>
            <dd>{formatCurrency(service.price)}</dd>
          </div>
        ))}
      </dl>}
    </section>
  )
}
