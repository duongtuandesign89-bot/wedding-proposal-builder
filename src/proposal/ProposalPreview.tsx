import type { Proposal } from '../types/proposal'
import { ProposalDocument } from './ProposalDocument'
import { ProposalScaleFrame } from './ProposalScaleFrame'
import { getProposalDisplayName } from '../utils/proposalDisplayName'
import type { ReactNode } from 'react'

export function ProposalPreview({ proposal, exportControl }: { proposal: Proposal; exportControl?: ReactNode }) {
  return (
    <main className="proposal-preview" aria-label="Live proposal preview">
      <header className="preview-toolbar">
        <div>
          <span className="preview-eyebrow">Live preview</span>
          <strong>{getProposalDisplayName(proposal)}</strong>
        </div>
        {exportControl}
      </header>
      <div className="proposal-preview-canvas">
        <ProposalScaleFrame><ProposalDocument proposal={proposal} /></ProposalScaleFrame>
      </div>
    </main>
  )
}
