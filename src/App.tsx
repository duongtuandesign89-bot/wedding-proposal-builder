import { useEffect, useState } from 'react'
import { createDefaultProposal } from './data/defaultProposal'
import { PersistedEditorSession } from './editor/PersistedEditorSession'
import { ProposalLibrary } from './library/ProposalLibrary'
import { createMemoryRepository, createProposalRepository } from './storage/proposalRepository'
import type { LoadedProposal, ProposalRepository, SavedProposal } from './storage/proposalRepository'

export default function App({ repository: suppliedRepository }: { repository?: ProposalRepository } = {}) {
  const [repository, setRepository] = useState(() => suppliedRepository ?? createProposalRepository())
  const [volatile, setVolatile] = useState(false)
  const [records, setRecords] = useState<SavedProposal[]>([])
  const [opened, setOpened] = useState<(Pick<LoadedProposal, 'proposal' | 'image'> & { unsaved?: boolean }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    setLoading(true)
    repository.list().then(rows => { if (active) { setRecords(rows); setLoading(false) } }).catch(cause => {
      console.error('Cannot open proposal storage', cause)
      if (active) { setVolatile(true); setRepository(createMemoryRepository()) }
    })
    return () => { active = false }
  }, [repository])
  const refresh = async () => { setRecords(await repository.list()) }
  const run = async (operation: () => Promise<void>) => {
    setBusy(true); setError('')
    try { await operation() }
    catch (cause) { console.error('Proposal library operation failed', cause); setError('Không thể thực hiện thao tác. Dữ liệu hiện có không bị xóa. Vui lòng thử lại.') }
    finally { setBusy(false) }
  }
  if (opened) return <PersistedEditorSession key={opened.proposal.id} draft={opened} repository={repository} volatile={volatile} unsaved={opened.unsaved}
    onBack={() => { setOpened(null); void run(refresh) }} />
  return <ProposalLibrary records={records} loading={loading} busy={busy} warning={volatile} error={error}
    onCreate={() => { void run(async () => {
      const proposal = createDefaultProposal()
      try { await repository.save(proposal, null); setOpened({ proposal, image: null }) }
      catch (cause) { console.error('New draft storage failed; keeping editable draft in memory', cause); setOpened({ proposal, image: null, unsaved: true }) }
    }) }}
    onOpen={id => { void run(async () => {
      const draft = await repository.load(id)
      if (!draft) throw new Error('Proposal no longer exists')
      setOpened(draft)
    }) }}
    onDuplicate={id => { void run(async () => { await repository.duplicate(id); await refresh() }) }}
    onDelete={async id => { let success = false; await run(async () => { await repository.delete(id); await refresh(); success = true }); return success }} />
}
