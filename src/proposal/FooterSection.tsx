import type { Contact } from '../types/proposal'

export function FooterSection({ contact }: { contact: Contact }) {
  const fields = [contact.phone, contact.secondaryPhone, contact.email, contact.website, contact.social, contact.address].filter((value): value is string => !!value?.trim())
  if (!contact.enabled || (!contact.studioName.trim() && !fields.length)) return null
  return (
    <footer className="document-footer" aria-label="Liên hệ">
      {contact.studioName.trim() && <span>{contact.studioName}</span>}
      {fields.length > 0 && <div className="footer-contact-details">{fields.map((text, index) => <p key={index}>{text}</p>)}</div>}
    </footer>
  )
}
