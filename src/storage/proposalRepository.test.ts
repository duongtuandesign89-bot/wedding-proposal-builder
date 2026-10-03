import { IDBFactory, IDBObjectStore } from 'fake-indexeddb'
import { Blob as NodeBlob } from 'node:buffer'
import { demoProposal } from '../data/demoProposal'
import { createDefaultProposal } from '../data/defaultProposal'
import { createProposalRepository } from './proposalRepository'
import { getProposalDisplayName } from '../utils/proposalDisplayName'

// jsdom Blob lacks structured-clone support; Node Blob preserves real bytes in fake IndexedDB.
const Blob = NodeBlob as unknown as typeof globalThis.Blob

describe('local proposal repository', () => {
  let factory: IDBFactory
  beforeEach(() => { factory = new IDBFactory() })
  const repo = () => createProposalRepository(factory)
  it('prefills new proposal contacts and preserves manually cleared contacts on reload', async () => {
    const proposal = createDefaultProposal()
    expect(proposal.contact.phone).toBe('(+84) 703 654 945')
    expect(proposal.contact.website).toBe('www.facebook.com/solisstudiovn')
    await repo().save({ ...proposal, contact: { ...proposal.contact, phone: '', website: '' } }, null)
    const restored = await repo().load(proposal.id)
    expect(restored?.proposal.contact.phone).toBe('')
    expect(restored?.proposal.contact.website).toBe('')
  })
  it('starts empty and creates a default with unique nested IDs and no demo clients', async () => {
    expect(await repo().list()).toEqual([])
    const a = createDefaultProposal(), b = createDefaultProposal()
    expect(a.couple).toEqual({ brideName: '', groomName: '' })
    expect(a.events).toHaveLength(1)
    expect(a.id).not.toBe(b.id)
    expect(a.events[0].id).not.toBe(b.events[0].id)
    expect(a.events[0].services[0].id).not.toBe(b.events[0].services[0].id)
    await repo().save(a, null)
    expect((await repo().list())[0].proposal.id).toBe(a.id)
  })
  it('loads complete B1/B3 JSON and crop through a fresh repository instance', async () => {
    const proposal = structuredClone(demoProposal)
    proposal.heroImage = { ...proposal.heroImage, positionX: 23, positionY: 67, zoom: 1.8 }
    proposal.introduction = { enabled: true, text: 'Cảm ơn\nHai bạn.' }
    proposal.adjustments = [{ id: 'discount', name: 'Ưu đãi', amount: -500000 }]
    await repo().save(proposal, null)
    const loaded = await repo().load(proposal.id)
    expect(loaded?.proposal).toEqual(proposal)
    expect(JSON.parse(JSON.stringify(loaded?.record.proposal))).toEqual(loaded?.record.proposal)
  })
  it('updates changed business data, retains createdAt, skips unchanged saves', async () => {
    const repository = repo()
    const first = await repository.save(demoProposal, null)
    const unchanged = await repository.save(structuredClone(demoProposal), null)
    expect(unchanged.updatedAt).toBe(first.updatedAt)
    const next = await repository.save({ ...demoProposal, location: 'Đà Lạt' }, null)
    expect(next.createdAt).toBe(first.createdAt)
    expect(next.updatedAt).toBeGreaterThan(first.updatedAt)
    expect((await repository.load(demoProposal.id))?.proposal.location).toBe('Đà Lạt')
  })
  it('sorts newest first and searches Vietnamese bride/groom/location case-insensitively', async () => {
    const repository = repo()
    await repository.save(demoProposal, null)
    await repository.save({ ...demoProposal, id: 'other', couple: { brideName: 'Ánh', groomName: 'Đức' }, location: 'Đà Lạt' }, null)
    expect((await repository.list()).map(r => r.id)).toEqual(['other', demoProposal.id])
    expect((await repository.list('NGỌC')).map(r => r.id)).toEqual([demoProposal.id])
    expect((await repository.list('đỨc')).map(r => r.id)).toEqual(['other'])
    expect((await repository.list('đÀ lẠt')).map(r => r.id)).toEqual(['other'])
  })
  it('stores original Blob, never stores object URL, restores crop', async () => {
    const original = new Blob(['original bytes'], { type: 'image/jpeg' })
    await repo().save({ ...demoProposal, heroImage: { src: 'blob:runtime', positionX: 29, positionY: 77, zoom: 2 } }, original)
    const loaded = await repo().load(demoProposal.id)
    expect(await loaded?.image?.text()).toBe('original bytes')
    expect(loaded?.image?.type).toBe('image/jpeg')
    expect(loaded?.record.proposal.heroImage).not.toHaveProperty('src')
    expect(loaded?.proposal.heroImage).toMatchObject({ positionX: 29, positionY: 77, zoom: 2 })
  })
  it('duplicates all IDs without changing couple data and owns an independent image', async () => {
    const repository = repo()
    const original = await repository.save({ ...demoProposal, heroImage: { ...demoProposal.heroImage, src: 'blob:old' } }, new Blob(['wedding']))
    const copy = await repository.duplicate(original.id)
    expect(copy.id).not.toBe(original.id)
    expect(copy.proposal.couple).toEqual(original.proposal.couple)
    expect(copy.imageId).not.toBe(original.imageId)
    const originalIds = original.proposal.events.flatMap(e => [e.id, ...e.services.map(s => s.id)])
    expect(copy.proposal.events.flatMap(e => [e.id, ...e.services.map(s => s.id)]).some(id => originalIds.includes(id))).toBe(false)
    await repository.delete(original.id)
    expect(await repository.load(original.id)).toBeNull()
    expect(await (await repository.load(copy.id))?.image?.text()).toBe('wedding')
    await repository.delete(copy.id)
    const db = await new Promise<IDBDatabase>((resolve) => { const r = factory.open('solis-proposal-builder', 1); r.onsuccess = () => resolve(r.result) })
    const count = await new Promise<number>(resolve => { const r = db.transaction('images').objectStore('images').count(); r.onsuccess = () => resolve(r.result) })
    expect(count).toBe(0)
    db.close()
  })
  it('cleans replaced and removed Hero Blobs', async () => {
    const repository = repo()
    await repository.save({ ...demoProposal, heroImage: { ...demoProposal.heroImage, src: 'blob:one' } }, new Blob(['one']))
    await repository.save({ ...demoProposal, heroImage: { ...demoProposal.heroImage, src: 'blob:two' } }, new Blob(['two']))
    expect(await (await repository.load(demoProposal.id))?.image?.text()).toBe('two')
    await repository.save(demoProposal, null)
    expect((await repository.load(demoProposal.id))?.image).toBeNull()
  })
  it('rejects unavailable storage honestly', async () => {
    await expect(createProposalRepository(undefined).list()).rejects.toThrow()
  })
  it('aborts failed image replacement without losing old image or proposal', async () => {
    const repository = repo()
    const original = await repository.save(demoProposal, new Blob(['old original']))
    const put = IDBObjectStore.prototype.put
    const failure = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function(this: IDBObjectStore, ...args: Parameters<typeof put>) {
      if (this.name === 'images') throw new DOMException('Full disk', 'QuotaExceededError')
      return put.apply(this, args)
    })
    await expect(repository.save({ ...demoProposal, location: 'Changed' }, new Blob(['new']))).rejects.toThrow('Full disk')
    failure.mockRestore()
    const restored = await repository.load(demoProposal.id)
    expect(restored?.record).toEqual(original)
    expect(await restored?.image?.text()).toBe('old original')
  })
  it('provides unnamed fallback without inventing a separate filename', () => {
    expect(getProposalDisplayName({ couple: { brideName: ' ', groomName: '' } }, 'library')).toBe('Báo giá chưa đặt tên')
    expect(getProposalDisplayName({ couple: { brideName: '', groomName: 'Đức' } }, 'library')).toBe('Đức')
  })
})
