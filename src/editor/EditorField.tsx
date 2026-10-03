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
  optional?: boolean
  placeholder?: string
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
  optional = false,
  placeholder,
}: EditorFieldProps) {
  return (
    <label className="editor-field">
      <span>{label}{optional && <small className="editor-field-optional" aria-hidden="true"> — optional</small>}</span>
      <input
        ref={inputRef}
        type={type}
        inputMode={inputMode}
        aria-label={optional ? label : undefined}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </label>
  )
}
