import { useEffect, useRef, useState } from 'react'
import type { LoadedProposal, ProposalRepository } from '../storage/proposalRepository'
import type { Proposal } from '../types/proposal'
import { EditorWorkspace } from './EditorWorkspace'

export function PersistedEditorSession({ draft, repository, onBack, volatile, unsaved }: {
  draft: Pick<LoadedProposal, 'proposal' | 'image'>; repository: ProposalRepository; onBack: () => void; volatile: boolean; unsaved?: boolean
}) {
  const [ready, setReady] = useState<Proposal | null>(null)
  const ownedUrl = useRef<string | null>(null)
  const releaseImage = () => {
    if (ownedUrl.current) { URL.revokeObjectURL(ownedUrl.current); ownedUrl.current = null }
  }
  useEffect(() => {
    const url = draft.image ? URL.createObjectURL(draft.image) : null
    ownedUrl.current = url
    setReady({ ...draft.proposal, heroImage: { ...draft.proposal.heroImage, src: url ?? draft.proposal.heroImage.src } })
    return () => { if (ownedUrl.current === url) releaseImage() }
  }, [draft])
  return ready ? <EditorWorkspace initialProposal={ready} initialImage={draft.image} repository={repository} onBack={onBack} volatile={volatile} unsaved={unsaved} onInitialImageUnused={releaseImage} /> : <p role="status">Đang mở báo giá…</p>
}
