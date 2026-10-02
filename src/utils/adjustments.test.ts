import { calculateProposalTotal, formatSignedCurrency, parseSignedCurrencyInput } from './currency'

describe('adjustment calculations', () => {
  it.each([
    ['', 0], ['0', 0], ['4500000', 4500000], ['+1.500.000', 1500000],
    ['-1.000.000', -1000000], ['−1.000.000', -1000000], ['-', 0], ['abc', 0], ['1e6', 0],
  ])('parses %s as %s without NaN', (input, expected) => {
    expect(parseSignedCurrencyInput(input)).toBe(expected)
  })
  it('formats signed adjustments', () => {
    expect(formatSignedCurrency(1500000)).toBe('+1.500.000')
    expect(formatSignedCurrency(-1000000)).toBe('−1.000.000')
    expect(formatSignedCurrency(0)).toBe('0')
  })
  it('derives service-only and adjusted totals', () => {
    const events = [{ services: [{ price: 4500000 }, { price: 4000000 }] }, { services: [{ price: 13500000 }] }]
    expect(calculateProposalTotal({ events, adjustments: [] })).toBe(22000000)
    expect(calculateProposalTotal({ events, adjustments: [{ amount: 1500000 }, { amount: -1000000 }] })).toBe(22500000)
  })
  it('handles empty proposals and retains negative totals', () => {
    expect(calculateProposalTotal({ events: [], adjustments: [] })).toBe(0)
    expect(calculateProposalTotal({ events: [], adjustments: [{ amount: -1000000 }] })).toBe(-1000000)
  })
})
