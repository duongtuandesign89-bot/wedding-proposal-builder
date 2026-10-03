import { useEffect, useRef, useState } from 'react'
import type { Proposal } from '../types/proposal'
import type { ProposalRepository } from '../storage/proposalRepository'
import { createAutosave } from '../storage/autosave'
import type { AutosaveController, SaveStatus } from '../storage/autosave'
import { ProposalEditor } from './ProposalEditor'
import { useProposalEditor } from './useProposalEditor'
import { ProposalPreview } from '../proposal/ProposalPreview'
import { ExportControl } from '../export/ExportControl'
import { exportProposal } from '../export/exportProposal'
import type { ExportOptions } from '../export/exportOptions'

export function EditorWorkspace({ initialProposal, initialImage = null, repository, onBack, volatile = false, unsaved = false, onInitialImageUnused }: {
  initialProposal: Proposal; initialImage?: Blob | null; repository?: ProposalRepository; onBack?: () => void; volatile?: boolean; unsaved?: boolean; onInitialImageUnused?: () => void
}) {
  const { proposal, ...actions } = useProposalEditor(initialProposal)
  const [image, setImage] = useState<Blob | null>(initialImage)
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor')
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [savingBack, setSavingBack] = useState(false)
  const controller = useRef<AutosaveController | null>(null)
  const snapshot = useRef({ proposal, image })
  snapshot.current = { proposal, image }
  useEffect(() => {
    if (!repository) return
    const autosave = createAutosave(repository, { proposal: initialProposal, image: initialImage }, setStatus, !unsaved)
    controller.current = autosave
    autosave.update(snapshot.current)
    const flush = () => { void autosave.flush().catch(error => console.error('Proposal lifecycle save failed', error)) }
    const hidden = () => { if (document.visibilityState === 'hidden') flush() }
    const unload = (event: BeforeUnloadEvent) => {
      if (autosave.isPending()) { flush(); event.preventDefault(); event.returnValue = '' }
    }
    document.addEventListener('visibilitychange', hidden)
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', unload)
    return () => {
      document.removeEventListener('visibilitychange', hidden)
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', unload)
      flush(); autosave.dispose(); controller.current = null
    }
  }, [repository, initialProposal, initialImage, unsaved])
  useEffect(() => { controller.current?.update({ proposal, image }) }, [proposal, image])
  const back = async () => {
    setSavingBack(true)
    try { await controller.current?.flush(); onBack?.() }
    catch (error) { console.error('Cannot leave unsaved proposal', error); setSavingBack(false) }
  }
  const saveLabel = !repository ? 'Live' : volatile || status === 'error' ? 'Không thể lưu' : status === 'saving' ? 'Đang lưu…' : 'Đã lưu'
  const exportCurrent = async (options: ExportOptions) => {
    const current = snapshot.current
    controller.current?.update(current)
    try { await controller.current?.flush() }
    catch (error) { console.error('Autosave before export failed; exporting current in-memory draft', error) }
    await exportProposal(current.proposal, options, current.image)
  }
  const exportControl = <ExportControl onExport={exportCurrent} />
  return <div className={`app-shell app-shell--${mobileView}`}>
    <nav className="mobile-mode-switch" aria-label="View mode">
      <button type="button" className={mobileView === 'editor' ? 'is-active' : ''} aria-pressed={mobileView === 'editor'} onClick={() => setMobileView('editor')}>Chỉnh sửa</button>
      <button type="button" className={mobileView === 'preview' ? 'is-active' : ''} aria-pressed={mobileView === 'preview'} onClick={() => setMobileView('preview')}>Xem trước</button>
    </nav>
    {(volatile || status === 'error') && <div className="storage-warning" role="alert">Không thể lưu dữ liệu trên thiết bị này. {volatile ? 'Dữ liệu chỉ tồn tại trong phiên đang mở.' : 'Thay đổi vẫn được giữ trong Editor.'}
      {!volatile && <button type="button" onClick={() => { void controller.current?.flush().catch(error => console.error('Proposal save retry failed', error)) }}>Thử lưu lại</button>}
    </div>}
    <ProposalEditor proposal={proposal} actions={actions} saveStatus={saveLabel} onBack={onBack ? () => { void back() } : undefined} savingBack={savingBack}
      exportControl={mobileView === 'editor' ? exportControl : undefined}
      onAssetChange={(next, file) => { setImage(file); actions.updateHeroImage(next); onInitialImageUnused?.() }} />
    <ProposalPreview proposal={proposal} exportControl={mobileView === 'preview' ? exportControl : undefined} />
  </div>
}
