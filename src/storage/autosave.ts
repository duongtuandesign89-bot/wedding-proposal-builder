import type { Proposal } from '../types/proposal'
import type { ProposalRepository } from './proposalRepository'

export type SaveStatus = 'saving' | 'saved' | 'error'
export interface DraftSnapshot { proposal: Proposal; image: Blob | null }
function fingerprint(snapshot: DraftSnapshot): string {
  const { src: _src, ...crop } = snapshot.proposal.heroImage
  return JSON.stringify({ ...snapshot.proposal, heroImage: crop })
}

export function createAutosave(repository: ProposalRepository, initial: DraftSnapshot, onStatus: (status: SaveStatus) => void = () => {}, initiallySaved = true) {
  let latest = initial, savedKey = initiallySaved ? fingerprint(initial) : '', savedImage = initial.image
  let timer: ReturnType<typeof setTimeout> | undefined
  let inFlight: Promise<void> | null = null
  let disposed = false
  const isPending = () => fingerprint(latest) !== savedKey || latest.image !== savedImage
  const cancelTimer = () => { clearTimeout(timer); timer = undefined }
  const flush = (): Promise<void> => {
    cancelTimer()
    if (inFlight) return inFlight
    if (!isPending()) { if (!disposed) onStatus('saved'); return Promise.resolve() }
    onStatus('saving')
    inFlight = (async () => {
      try {
        while (isPending()) {
          const snapshot = latest, key = fingerprint(snapshot)
          await repository.save(snapshot.proposal, snapshot.image)
          savedKey = key; savedImage = snapshot.image
        }
        if (!disposed) onStatus('saved')
      } catch (error) {
        if (!disposed) onStatus(isPending() ? 'error' : 'saved')
        throw error
      } finally { inFlight = null }
    })()
    return inFlight
  }
  return {
    update(snapshot: DraftSnapshot) {
      latest = snapshot
      cancelTimer()
      if (!isPending()) { if (!inFlight) onStatus('saved'); return }
      onStatus('saving')
      timer = setTimeout(() => { void flush().catch(error => console.error('Proposal autosave failed', error)) }, 700)
    },
    flush, isPending,
    dispose() { disposed = true; cancelTimer() },
  }
}
export type AutosaveController = ReturnType<typeof createAutosave>
