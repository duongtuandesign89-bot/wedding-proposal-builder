import type { ChangeEventHandler, HTMLInputTypeAttribute } from 'react'

interface EditorFieldProps {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  type?: HTMLInputTypeAttribute
  inputMode?: 'text' | 'numeric'
}

export function EditorField({
  label,
  value,
  onChange,
  type = 'text',
  inputMode = 'text',
}: EditorFieldProps) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
      />
    </label>
  )
}
