const ASSET_TIMEOUT = 20_000
function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ASSET_TIMEOUT)
    promise.then(value => { clearTimeout(timer); resolve(value) }, error => { clearTimeout(timer); reject(error) })
  })
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const clear = () => { clearTimeout(timer); image.removeEventListener('load', loaded); image.removeEventListener('error', failed) }
    const failed = () => { clear(); reject(new Error(`Export image failed: ${image.src}`)) }
    const loaded = () => {
      clear()
      if (!image.naturalWidth) { failed(); return }
      withTimeout(image.decode ? image.decode() : Promise.resolve(), 'Export image decode timed out').then(resolve, reject)
    }
    const timer = setTimeout(failed, ASSET_TIMEOUT)
    image.addEventListener('load', loaded, { once: true }); image.addEventListener('error', failed, { once: true })
    if (image.complete) loaded()
  })
}

export async function prepareExport(root: HTMLElement): Promise<void> {
  if (!document.fonts) throw new Error('Export font loading API unavailable')
  await withTimeout(document.fonts.ready, 'Export font readiness timed out')
  const sample = root.textContent || 'Wedding Proposal — Đặt cọc 30% để xác nhận lịch.'
  const faces = await withTimeout(Promise.all([
    '400 24px "Bodoni Moda"', '400 24px "Lora"', '400 24px "Inter"', '500 24px "Inter"',
  ].map(font => document.fonts.load(font, sample))), 'Export font loading timed out')
  if (faces.some(group => !group.length || group.some(face => face.status !== 'loaded'))) throw new Error('Export font is missing or not loaded')
  await Promise.all(Array.from(root.querySelectorAll('img')).map(waitForImage))
  // React applies PositionedImage's natural-dimension crop and ResizeObserver
  // applies Hero's canonical scale before measurement/capture. Background tabs
  // throttle RAF, so each frame also has a short bounded fallback.
  for (let i = 0; i < 2; i++) await new Promise<void>(resolve => {
    const timer = setTimeout(resolve, 100)
    requestAnimationFrame(() => { clearTimeout(timer); resolve() })
  })
}
