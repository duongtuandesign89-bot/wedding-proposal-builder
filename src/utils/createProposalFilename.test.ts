import { expect, it } from 'vitest'
import { createProposalFilename } from './createProposalFilename'

it.each([
  ['Ngọc', 'Huy', 'jpg', 'Ngọc-Huy-Wedding-Proposal.jpg'],
  [' Ngọc ', '', 'jpg', 'Ngọc-Wedding-Proposal.jpg'],
  ['', ' Huy ', 'png', 'Huy-Wedding-Proposal.png'],
  ['', '', 'jpg', 'Wedding-Proposal.jpg'],
  ['TRẦN THỊ NGỌC ÁNH', 'NGUYỄN HOÀNG PHƯƠNG', 'png', 'TRẦN-THỊ-NGỌC-ÁNH-NGUYỄN-HOÀNG-PHƯƠNG-Wedding-Proposal.png'],
  [' ../Ngọc:*? ', 'Huy\\/<>|"', 'jpg', 'Ngọc-Huy-Wedding-Proposal.jpg'],
] as const)('creates a safe filename for %s / %s', (brideName, groomName, format, expected) => {
  expect(createProposalFilename({ couple: { brideName, groomName } }, format)).toBe(expected)
})

it('normalizes decomposed Vietnamese and limits long filenames', () => {
  expect(createProposalFilename({ couple: { brideName: 'Ngọc', groomName: '' } }, 'jpg')).toBe('Ngọc-Wedding-Proposal.jpg')
  expect(createProposalFilename({ couple: { brideName: 'Á'.repeat(500), groomName: '' } }, 'jpg').length).toBeLessThan(121)
})
