import type { ChangeEventHandler } from 'react'

export function EditorTextarea({ label, value, onChange }: {
  label: string; value: string; onChange: ChangeEventHandler<HTMLTextAreaElement>
}) {
  return <label className="editor-field">
    <span>{label}</span>
    <textarea rows={3} value={value} onChange={onChange} />
  </label>
}
