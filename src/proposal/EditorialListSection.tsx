import type { TextListSection } from '../types/proposal'

export function EditorialListSection({ content, kind }: { content: TextListSection; kind: 'notes' | 'terms' }) {
  const items = content.items.filter(text => text.trim())
  if (!content.enabled || !items.length) return null
  const label = kind === 'notes' ? 'Ghi chú' : 'Điều khoản'
  return <section className={`proposal-content-list proposal-${kind}`} aria-label={label}>
    <h2 className="document-label">{label}</h2>
    <ol className="editorial-text-list">
      {items.map((text, index) => <li key={index}><span className="editorial-item-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{text}</p></li>)}
    </ol>
  </section>
}
