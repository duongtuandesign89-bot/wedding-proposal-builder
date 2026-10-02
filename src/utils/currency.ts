type ServiceCollection = Array<{
  services: Array<{ price: number }>
}>

export function normalizeSignedAmount(value: number): number {
  return Number.isFinite(value) ? Math.round(value) : 0
}

export function parseSignedCurrencyInput(value: string): number {
  const normalized = value.trim().replace(/^−/, '-')
  if (!/^[+-]?[\d.,\s]+$/.test(normalized)) return 0
  return normalizeSignedAmount(Number(normalized.replace(/[.,\s]/g, '')))
}

export function formatSignedCurrency(value: number): string {
  const amount = normalizeSignedAmount(value)
  return `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${formatter.format(Math.abs(amount))}`
}

export function formatProposalTotal(value: number): string {
  const amount = normalizeSignedAmount(value)
  return `${amount < 0 ? '−' : ''}${formatter.format(Math.abs(amount))}`
}

export function calculateProposalTotal(proposal: {
  events: ServiceCollection
  adjustments: Array<{ amount: number }>
}): number {
  return calculateTotal(proposal.events) + proposal.adjustments.reduce(
    (total, adjustment) => total + normalizeSignedAmount(adjustment.amount), 0,
  )
}

const formatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
})

export function normalizeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0
}

export function formatCurrency(value: number, includeCurrency = false): string {
  const formatted = formatter.format(normalizeAmount(value))
  return includeCurrency ? `${formatted} VND` : formatted
}

export function parseCurrencyInput(value: string): number {
  const normalized = value.trim()
  if (!normalized || !/^[\d.,\s]+$/.test(normalized)) return 0

  const digits = normalized.replace(/[.,\s]/g, '')
  return digits ? normalizeAmount(Number(digits)) : 0
}

export function calculateTotal(events: ServiceCollection): number {
  return events.reduce(
    (proposalTotal, event) =>
      proposalTotal +
      event.services.reduce(
        (eventTotal, service) => eventTotal + normalizeAmount(service.price),
        0,
      ),
    0,
  )
}
