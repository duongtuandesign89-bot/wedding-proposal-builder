import type { ChangeEventHandler, FocusEventHandler, HTMLInputTypeAttribute, Ref } from 'react'

interface EditorFieldProps {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  type?: HTMLInputTypeAttribute
  inputMode?: 'text' | 'numeric'
  inputRef?: Ref<HTMLInputElement>
  onFocus?: FocusEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
}

export function EditorField({
  label,
  value,
  onChange,
  type = 'text',
  inputMode = 'text',
  inputRef,
  onFocus,
  onBlur,
}: EditorFieldProps) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <input
        ref={inputRef}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </label>
  )
}
