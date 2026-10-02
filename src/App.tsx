import { useState } from 'react'
import { demoProposal } from './data/demoProposal'
import { ProposalEditor } from './editor/ProposalEditor'
import { useProposalEditor } from './editor/useProposalEditor'
import { ProposalPreview } from './proposal/ProposalPreview'

type MobileView = 'editor' | 'preview'

export default function App() {
  const { proposal, ...actions } = useProposalEditor(demoProposal)
  const [mobileView, setMobileView] = useState<MobileView>('editor')
  return (
    <div className={`app-shell app-shell--${mobileView}`}>
      <nav className="mobile-mode-switch" aria-label="View mode">
        <button type="button" className={mobileView === 'editor' ? 'is-active' : ''} aria-pressed={mobileView === 'editor'} onClick={() => setMobileView('editor')}>Chỉnh sửa</button>
        <button type="button" className={mobileView === 'preview' ? 'is-active' : ''} aria-pressed={mobileView === 'preview'} onClick={() => setMobileView('preview')}>Xem trước</button>
      </nav>
      <ProposalEditor proposal={proposal} actions={actions} />
      <ProposalPreview proposal={proposal} />
    </div>
  )
}
