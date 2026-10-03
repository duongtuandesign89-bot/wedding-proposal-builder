import { getProposalDisplayName } from './proposalDisplayName'

describe('central proposal display name', () => {
  it.each([
    [' Ngọc ', ' Huy ', 'Ngọc & Huy'],
    ['Ngọc', '', 'Ngọc'],
    ['', 'Huy', 'Huy'],
    [' ', '\n', 'Wedding Proposal'],
    ['Ánh Đào', 'Đức', 'Ánh Đào & Đức'],
  ])('formats bride %s and groom %s without dangling separators', (brideName, groomName, expected) => {
    expect(getProposalDisplayName({ couple: { brideName, groomName } })).toBe(expected)
  })
  it('centralizes unnamed fallbacks for clean Hero and clear Library', () => {
    const p = { couple: { brideName: '', groomName: '' } }
    expect(getProposalDisplayName(p, 'hero')).toBe('')
    expect(getProposalDisplayName(p, 'library')).toBe('Báo giá chưa đặt tên')
  })
})
