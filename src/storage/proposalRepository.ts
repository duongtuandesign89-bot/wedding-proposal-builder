import type { Proposal } from '../types/proposal'
import { DEFAULT_HERO_IMAGE } from '../utils/heroCrop'
import { createId } from '../utils/id'
import { openDatabase, readRequest, transactionDone } from './database'

export type StoredProposal = Omit<Proposal, 'heroImage'> & { heroImage: Omit<Proposal['heroImage'], 'src'> }
export interface SavedProposal { id: string; proposal: StoredProposal; imageId: string | null; createdAt: number; updatedAt: number }
export interface LoadedProposal { record: SavedProposal; proposal: Proposal; image: Blob | null }
export interface ProposalRepository {
  list(search?: string): Promise<SavedProposal[]>
  load(id: string): Promise<LoadedProposal | null>
  save(proposal: Proposal, image: Blob | null): Promise<SavedProposal>
  duplicate(id: string): Promise<SavedProposal>
  delete(id: string): Promise<void>
}
export function filterProposals(records: SavedProposal[], search = ''): SavedProposal[] {
  const query = search.trim().normalize('NFC').toLocaleLowerCase('vi-VN')
  return records.filter(({ proposal: p }) => [p.couple.brideName, p.couple.groomName, p.location].some(value => value.normalize('NFC').toLocaleLowerCase('vi-VN').includes(query)))
    .sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt)
}
function storedData(proposal: Proposal): StoredProposal {
  const { src: _src, ...crop } = proposal.heroImage
  return { ...proposal, heroImage: crop }
}
function loadedData(record: SavedProposal, image: Blob | null): LoadedProposal {
  return { record, image, proposal: { ...record.proposal, heroImage: { ...record.proposal.heroImage, src: image ? '' : DEFAULT_HERO_IMAGE.src } } }
}
function cloneProposal(proposal: Proposal): Proposal {
  const copy = structuredClone(proposal)
  copy.id = createId()
  copy.events.forEach(event => { event.id = createId(); event.services.forEach(service => { service.id = createId() }) })
  copy.adjustments.forEach(item => { item.id = createId() })
  return copy
}

export function createProposalRepository(factory = globalThis.indexedDB): ProposalRepository {
  let database: Promise<IDBDatabase> | undefined
  const db = () => database ??= openDatabase(factory).catch(error => { database = undefined; throw error })
  const imageIds = new WeakMap<Blob, string>()
  let lastTimestamp = 0
  const repository: ProposalRepository = {
    async list(search = '') {
      const database = await db()
      const records = await readRequest<SavedProposal[]>(database.transaction('proposals').objectStore('proposals').getAll())
      return filterProposals(records, search)
    },
    async load(id) {
      const database = await db()
      const tx = database.transaction(['proposals', 'images'])
      const record = await readRequest<SavedProposal | undefined>(tx.objectStore('proposals').get(id))
      if (!record) return null
      const imageRecord = record.imageId ? await readRequest<{ id: string; blob: Blob } | undefined>(tx.objectStore('images').get(record.imageId)) : undefined
      if (record.imageId && !imageRecord) throw new Error('Hero image is missing from IndexedDB')
      if (imageRecord) imageIds.set(imageRecord.blob, imageRecord.id)
      return loadedData(record, imageRecord?.blob ?? null)
    },
    async save(proposal, image) {
      const database = await db()
      const tx = database.transaction(['proposals', 'images'], 'readwrite')
      const completion = transactionDone(tx)
      // Attach a rejection handler immediately; a failed request may abort before the await below.
      void completion.catch(() => {})
      try {
        const proposals = tx.objectStore('proposals'), images = tx.objectStore('images')
        const previous = await readRequest<SavedProposal | undefined>(proposals.get(proposal.id))
        const knownImageId = image ? imageIds.get(image) : null
        const imageId = image ? (previous?.imageId && knownImageId === previous.imageId ? knownImageId : createId()) : null
        const data = storedData(proposal)
        if (previous && previous.imageId === imageId && JSON.stringify(previous.proposal) === JSON.stringify(data)) {
          await completion
          return previous
        }
        const timestamp = Math.max(Date.now(), lastTimestamp + 1, (previous?.updatedAt ?? 0) + 1)
        lastTimestamp = timestamp
        const record: SavedProposal = { id: proposal.id, proposal: data, imageId: imageId ?? null, createdAt: previous?.createdAt ?? timestamp, updatedAt: timestamp }
        if (image && imageId && imageId !== previous?.imageId) images.put({ id: imageId, blob: image })
        proposals.put(record)
        if (previous?.imageId && previous.imageId !== imageId) images.delete(previous.imageId)
        await completion
        if (image && imageId) imageIds.set(image, imageId)
        return record
      } catch (error) {
        try { tx.abort() } catch { /* transaction already completed/aborted */ }
        throw error
      }
    },
    async duplicate(id) {
      const original = await repository.load(id)
      if (!original) throw new Error('Proposal not found')
      return repository.save(cloneProposal(original.proposal), original.image)
    },
    async delete(id) {
      const database = await db()
      const tx = database.transaction(['proposals', 'images'], 'readwrite')
      const completion = transactionDone(tx)
      void completion.catch(() => {})
      const previous = await readRequest<SavedProposal | undefined>(tx.objectStore('proposals').get(id))
      tx.objectStore('proposals').delete(id)
      if (previous?.imageId) tx.objectStore('images').delete(previous.imageId)
      await completion
    },
  }
  return repository
}

// Explicit volatile fallback: never presented as durable or "Đã lưu".
export function createMemoryRepository(): ProposalRepository {
  const records = new Map<string, SavedProposal>(), images = new Map<string, Blob>()
  let clock = 0
  const repository: ProposalRepository = {
    async list(search = '') { return filterProposals([...records.values()], search) },
    async load(id) { const record = records.get(id); return record ? loadedData(structuredClone(record), images.get(id) ?? null) : null },
    async save(proposal, image) {
      const previous = records.get(proposal.id)
      const data = storedData(proposal)
      if (previous && images.get(proposal.id) === (image ?? undefined) && JSON.stringify(previous.proposal) === JSON.stringify(data)) return previous
      clock = Math.max(Date.now(), clock + 1)
      const record = { id: proposal.id, proposal: structuredClone(data), imageId: image ? proposal.id : null, createdAt: previous?.createdAt ?? clock, updatedAt: clock }
      records.set(record.id, record)
      if (image) images.set(record.id, image); else images.delete(record.id)
      return record
    },
    async duplicate(id) { const original = await repository.load(id); if (!original) throw new Error('Proposal not found'); return repository.save(cloneProposal(original.proposal), original.image) },
    async delete(id) { records.delete(id); images.delete(id) },
  }
  return repository
}
