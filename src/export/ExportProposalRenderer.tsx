import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import type { Proposal } from '../types/proposal'
import { ProposalDocument, PROPOSAL_DESIGN_WIDTH } from '../proposal/ProposalDocument'

export function ExportProposalRenderer({ proposal }: { proposal: Proposal }) {
  return <ProposalDocument proposal={proposal} mode="export" />
}

/** Render, don't clone the scaled preview. Own every temporary resource. */
export function mountExportProposal(proposal: Proposal, heroBlob?: Blob | null) {
  const host = document.createElement('div')
  host.dataset.exportHost = 'true'
  host.setAttribute('aria-hidden', 'true')
  host.inert = true
  Object.assign(host.style, { position: 'fixed', left: '-20000px', top: '0', width: `${PROPOSAL_DESIGN_WIDTH}px`, pointerEvents: 'none' })
  document.body.append(host)
  const root = createRoot(host)
  const snapshot = structuredClone(proposal)
  const imageUrl = heroBlob ? URL.createObjectURL(heroBlob) : null
  if (imageUrl) snapshot.heroImage.src = imageUrl
  const dispose = () => { root.unmount(); host.remove(); if (imageUrl) URL.revokeObjectURL(imageUrl) }
  try {
    flushSync(() => root.render(<ExportProposalRenderer proposal={snapshot} />))
    const element = host.querySelector<HTMLElement>('#proposal-export-document')
    if (!element) throw new Error('Export document was not mounted')
    return { element, dispose }
  } catch (error) { dispose(); throw error }
}
