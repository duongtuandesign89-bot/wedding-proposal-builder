import type { ReactNode } from 'react'

export function EditorGroup({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <details className="editor-section editor-group" open>
    <summary aria-label={title}>
      <div className="editor-section-heading"><span>{number}</span><h2>{title}</h2></div>
    </summary>
    <div className="editor-group-body">{children}</div>
  </details>
}
