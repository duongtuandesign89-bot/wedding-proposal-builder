import { createAutosave } from './autosave'
import { createMemoryRepository } from './proposalRepository'
import { demoProposal } from '../data/demoProposal'

describe('debounced autosave', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())
  it('debounces edits, ignores unchanged business data and flushes before navigation', async () => {
    const repository = createMemoryRepository()
    const initial = await repository.save(demoProposal, null)
    const save = createAutosave(repository, { proposal: demoProposal, image: null })
    save.update({ proposal: { ...demoProposal, location: 'Hà Nội' }, image: null })
    await vi.advanceTimersByTimeAsync(400)
    save.update({ proposal: { ...demoProposal, location: 'Đà Lạt' }, image: null })
    await vi.advanceTimersByTimeAsync(699)
    expect((await repository.load(demoProposal.id))?.proposal.location).toBe(demoProposal.location)
    await vi.advanceTimersByTimeAsync(1)
    expect((await repository.load(demoProposal.id))?.proposal.location).toBe('Đà Lạt')
    const written = (await repository.load(demoProposal.id))!.record
    save.update({ proposal: { ...demoProposal, location: 'Đà Lạt', heroImage: { ...demoProposal.heroImage, src: 'runtime-only' } }, image: null })
    await save.flush()
    expect((await repository.load(demoProposal.id))?.record.updatedAt).toBe(written.updatedAt)
    expect(written.updatedAt).toBeGreaterThan(initial.updatedAt)
    save.update({ proposal: { ...demoProposal, location: 'Cần Thơ' }, image: null })
    await save.flush()
    expect((await repository.load(demoProposal.id))?.proposal.location).toBe('Cần Thơ')
    expect(save.isPending()).toBe(false)
    save.dispose()
  })
  it('serializes in-flight writes and flushes edits made during a slow save', async () => {
    const repository = createMemoryRepository()
    let release!: () => void
    const barrier = new Promise<void>(resolve => { release = resolve })
    let first = true
    const slow = { ...repository, save: async (...args: Parameters<typeof repository.save>) => {
      if (first) { first = false; await barrier }
      return repository.save(...args)
    } }
    const save = createAutosave(slow, { proposal: demoProposal, image: null })
    save.update({ proposal: { ...demoProposal, location: 'First' }, image: null })
    const pending = save.flush()
    save.update({ proposal: { ...demoProposal, location: 'Latest' }, image: null })
    release()
    await pending
    expect((await repository.load(demoProposal.id))?.proposal.location).toBe('Latest')
    expect(save.isPending()).toBe(false)
    save.dispose()
  })
  it('retains dirty state on failed write and allows explicit retry', async () => {
    const repository = createMemoryRepository()
    let fail = true
    const statuses: string[] = []
    const save = createAutosave({ ...repository, save: async (...args: Parameters<typeof repository.save>) => {
      if (fail) throw new Error('quota')
      return repository.save(...args)
    } }, { proposal: demoProposal, image: null }, status => statuses.push(status))
    save.update({ proposal: { ...demoProposal, location: 'Đà Lạt' }, image: null })
    await expect(save.flush()).rejects.toThrow('quota')
    expect(statuses.at(-1)).toBe('error')
    expect(save.isPending()).toBe(true)
    fail = false
    await save.flush()
    expect(statuses.at(-1)).toBe('saved')
    expect((await repository.load(demoProposal.id))?.proposal.location).toBe('Đà Lạt')
    save.dispose()
  })
  it('clears stale error when a failed in-flight edit was reverted to the saved data', async () => {
    let reject!: (error: Error) => void
    const writing = new Promise<never>((_, fail) => { reject = fail })
    const statuses: string[] = []
    const save = createAutosave({ ...createMemoryRepository(), save: () => writing }, { proposal: demoProposal, image: null }, status => statuses.push(status))
    save.update({ proposal: { ...demoProposal, location: 'Changed' }, image: null })
    const pending = save.flush()
    save.update({ proposal: demoProposal, image: null })
    reject(new Error('quota'))
    await expect(pending).rejects.toThrow('quota')
    expect(save.isPending()).toBe(false)
    await save.flush()
    expect(statuses.at(-1)).toBe('saved')
    save.dispose()
  })
})
