export function TermsSection({ notes }: { notes: string }) {
  if (!notes.trim()) return null
  return (
    <section className="proposal-terms" aria-label="Notes and terms">
      <h2 className="document-label">Notes / Terms</h2>
      <p>{notes}</p>
    </section>
  )
}
