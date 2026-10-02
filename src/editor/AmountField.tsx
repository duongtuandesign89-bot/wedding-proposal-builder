import { useState } from 'react'
import { formatCurrency, formatSignedCurrency, parseCurrencyInput, parseSignedCurrencyInput } from '../utils/currency'
import { EditorField } from './EditorField'

// Keep only editing text locally (including a standalone minus); proposal values stay numeric.
export function AmountField({ label, value, signed = false, onChange }: {
  label: string; value: number; signed?: boolean; onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const format = signed ? formatSignedCurrency : formatCurrency
  const parse = signed ? parseSignedCurrencyInput : parseCurrencyInput
  return <EditorField label={label} value={draft ?? format(value)} inputMode={signed ? 'text' : 'numeric'}
    onFocus={() => setDraft(value === 0 ? '' : String(value))}
    onBlur={() => setDraft(null)}
    onChange={event => { setDraft(event.target.value); onChange(parse(event.target.value)) }} />
}
