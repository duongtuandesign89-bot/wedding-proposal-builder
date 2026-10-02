import { calculateTotal, formatCurrency, parseCurrencyInput } from './currency'

describe('currency utilities', () => {
  it('formats VND amounts with Vietnamese separators and optional suffix', () => {
    expect(formatCurrency(4_500_000)).toBe('4.500.000')
    expect(formatCurrency(22_000_000, true)).toBe('22.000.000 VND')
  })

  it('normalizes invalid amounts instead of leaking NaN into the proposal', () => {
    expect(formatCurrency(Number.NaN)).toBe('0')
    expect(parseCurrencyInput('')).toBe(0)
    expect(parseCurrencyInput('4.500.000')).toBe(4_500_000)
  })

  it('rejects negative, scientific, and alphanumeric price input', () => {
    expect(parseCurrencyInput('-500000')).toBe(0)
    expect(parseCurrencyInput('1e6')).toBe(0)
    expect(parseCurrencyInput('12abc34')).toBe(0)
  })

  it('totals every service across every event', () => {
    expect(
      calculateTotal([
        { services: [{ price: 4_500_000 }, { price: 4_000_000 }] },
        { services: [{ price: 5_500_000 }, { price: 8_000_000 }] },
      ]),
    ).toBe(22_000_000)
  })
})
