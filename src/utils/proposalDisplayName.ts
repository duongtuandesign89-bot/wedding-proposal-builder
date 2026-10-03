import type { Proposal } from '../types/proposal'

export function getProposalDisplayName(proposal: Pick<Proposal, 'couple'>, context: 'proposal' | 'hero' | 'library' = 'proposal'): string {
  const name = [proposal.couple.brideName.trim(), proposal.couple.groomName.trim()].filter(Boolean).join(' & ')
  if (name) return name
  return context === 'hero' ? '' : context === 'library' ? 'Báo giá chưa đặt tên' : 'Wedding Proposal'
}
