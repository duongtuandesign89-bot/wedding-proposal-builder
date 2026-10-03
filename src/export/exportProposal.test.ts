import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { demoProposal } from '../data/demoProposal'
import { exportProposal } from './exportProposal'

const boundary = vi.hoisted(() => ({ height: 4000, error: false, clipped: false, nullBlob: false, bottomBlank: false, opaqueBlank: false, captured: null as HTMLElement | null, canvas: null as HTMLCanvasElement | null, downloads: [] as string[] }))
vi.mock('./prepareExport', () => ({ prepareExport: async () => {} }))
vi.mock('./embedProposalFonts', () => ({ embedProposalFonts: async () => '@font-face{font-family:Inter;src:url(data:font/woff2;base64,Zm9udA==)}' }))
vi.mock('modern-screenshot', () => ({
  createContext: async (node: HTMLElement, options: { width: number; height: number; scale: number }) => ({ node, options }),
  destroyContext: () => {},
  domToCanvas: async ({ node, options }: { node: HTMLElement; options: { width: number; height: number; scale: number } }) => {
    boundary.captured = node
    if (boundary.error) throw new Error('Capture failed')
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(options.width * options.scale)
    canvas.height = boundary.clipped ? 1920 : Math.floor(options.height * options.scale)
    canvas.getContext = vi.fn(() => ({ getImageData: (_x: number, _y: number, width: number) => ({ data: [width > 1 && !boundary.opaqueBlank ? 255 : 17, 17, 15, boundary.bottomBlank ? 0 : 255] }) })) as unknown as typeof canvas.getContext
    canvas.toBlob = (callback, type) => callback(boundary.nullBlob ? null : new Blob(['encoded image'], { type }))
    boundary.canvas = canvas
    return canvas
  },
}))

beforeEach(() => {
  boundary.height = 4000; boundary.error = boundary.clipped = boundary.nullBlob = boundary.bottomBlank = boundary.opaqueBlank = false
  boundary.captured = boundary.canvas = null; boundary.downloads = []
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return { width: 1080, height: this.id === 'proposal-export-document' ? boundary.height : 810, top: 0, left: 0, bottom: boundary.height, right: 1080, x: 0, y: 0, toJSON: () => {} }
  })
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:export-test', revokeObjectURL: vi.fn() })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { boundary.downloads.push(this.download) })
  vi.useFakeTimers()
})
afterEach(() => { vi.runAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

it.each([2500, 4000, 6000])('exports full %ipx canonical document and releases temporary DOM/canvas', async height => {
  boundary.height = height
  const before = JSON.stringify(demoProposal)
  await exportProposal(demoProposal, { format: 'jpg', quality: 'standard' })
  expect(boundary.downloads).toEqual(['Ngọc-Huy-Wedding-Proposal.jpg'])
  expect(boundary.captured!.querySelector('.document-footer')).not.toBeNull()
  expect(document.querySelector('[data-export-host]')).toBeNull()
  expect(boundary.canvas!.width).toBe(0)
  expect(boundary.canvas!.height).toBe(0)
  expect(JSON.stringify(demoProposal)).toBe(before)
})
it('owns a fresh Blob URL for stored hero and revokes it even on capture failure', async () => {
  boundary.error = true
  await expect(exportProposal(demoProposal, { format: 'png', quality: 'high' }, new Blob(['image']))).rejects.toThrow('Capture failed')
  expect(boundary.captured!.querySelector('.hero-photograph img')).toHaveAttribute('src', 'blob:export-test')
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export-test')
  expect(document.querySelector('[data-export-host]')).toBeNull()
})
it('does not allow silent downscaling, clipping or blank bottom pixels', async () => {
  boundary.clipped = true
  await expect(exportProposal(demoProposal, { format: 'png', quality: 'high' })).rejects.toThrow(/dimension/i)
  boundary.clipped = false; boundary.bottomBlank = true
  await expect(exportProposal(demoProposal, { format: 'png', quality: 'high' })).rejects.toThrow(/canvas/i)
  expect(boundary.downloads).toHaveLength(0)
})
it('rejects an opaque blank canvas when the library swallowed its draw error', async () => {
  boundary.opaqueBlank = true
  await expect(exportProposal(demoProposal, { format: 'jpg', quality: 'standard' })).rejects.toThrow(/render/i)
  expect(boundary.downloads).toHaveLength(0)
})
it('fails encoding cleanly instead of downloading an empty file', async () => {
  boundary.nullBlob = true
  await expect(exportProposal(demoProposal, { format: 'jpg', quality: 'standard' })).rejects.toThrow(/encod/i)
  expect(boundary.downloads).toHaveLength(0)
  expect(document.querySelector('[data-export-host]')).toBeNull()
})
it('refuses excessive memory allocation before capture and cleans renderer', async () => {
  boundary.height = 20000
  await expect(exportProposal(demoProposal, { format: 'jpg', quality: 'high' })).rejects.toThrow('Báo giá quá dài')
  expect(boundary.captured).toBeNull()
  expect(document.querySelector('[data-export-host]')).toBeNull()
})
