import type { Proposal } from '../types/proposal'
import type { ExportFormat } from '../export/exportOptions'
import { getProposalDisplayName } from './proposalDisplayName'

export function createProposalFilename(proposal: Pick<Proposal, 'couple'>, format: ExportFormat): string {
  const name = getProposalDisplayName(proposal, 'hero').normalize('NFC')
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '')
    .replace(/[.&\s]+/g, '-').replace(/^-+|-+$/g, '')
  // Keep well below filesystem byte limits even with Vietnamese UTF-8 names.
  const shortName = Array.from(name).slice(0, 70).join('').replace(/-+$/g, '')
  return `${shortName ? `${shortName}-` : ''}Wedding-Proposal.${format}`
}
