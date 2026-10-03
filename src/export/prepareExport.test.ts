import { afterEach, expect, it, vi } from 'vitest'
import { prepareExport } from './prepareExport'

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })
function fixture() {
  const root = document.createElement('article')
  root.textContent = 'TRẦN THỊ NGỌC ÁNH — Đặt cọc 30% để xác nhận lịch.'
  const load = vi.fn(async (_font: string, _text: string) => [{ status: 'loaded' }])
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve(), load } })
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0))
  return { root, load }
}
it('waits for font readiness before loading all exact proposal faces with Vietnamese text', async () => {
  const { root, load } = fixture()
  let ready!: () => void
  Object.defineProperty(document.fonts, 'ready', { value: new Promise(resolve => { ready = () => resolve(document.fonts) }) })
  const prepared = prepareExport(root)
  await Promise.resolve()
  expect(load).not.toHaveBeenCalled()
  ready(); await prepared
  expect(load.mock.calls.map(call => call[0])).toEqual(['400 24px "Bodoni Moda"', '400 24px "Lora"', '400 24px "Inter"', '500 24px "Inter"'])
  expect(load.mock.calls[0][1]).toContain('TRẦN THỊ NGỌC ÁNH')
})
it('refuses a missing font instead of capturing browser fallback', async () => {
  const { root, load } = fixture()
  load.mockResolvedValue([])
  await expect(prepareExport(root)).rejects.toThrow(/font/i)
})
it('waits for a pending image, natural dimensions and decode', async () => {
  const { root } = fixture()
  const image = document.createElement('img')
  let complete = false, width = 0
  Object.defineProperties(image, { complete: { get: () => complete }, naturalWidth: { get: () => width } })
  const decode = vi.fn(async () => {})
  image.decode = decode; root.append(image)
  const prepared = prepareExport(root)
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(decode).not.toHaveBeenCalled()
  complete = true; width = 1000; image.dispatchEvent(new Event('load'))
  await prepared; expect(decode).toHaveBeenCalledOnce()
})
it('refuses a broken cached hero', async () => {
  const { root } = fixture()
  const image = document.createElement('img')
  Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 0 } })
  root.append(image)
  await expect(prepareExport(root)).rejects.toThrow(/image/i)
})
