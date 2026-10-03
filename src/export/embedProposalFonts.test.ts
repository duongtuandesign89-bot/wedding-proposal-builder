import { afterEach, expect, it, vi } from 'vitest'
import { embedProposalFonts } from './embedProposalFonts'

afterEach(() => { document.querySelectorAll('[data-font-test]').forEach(node => node.remove()); vi.unstubAllGlobals() })
function faces() {
  const style = document.createElement('style'); style.dataset.fontTest = 'true'
  style.textContent = ['Bodoni Moda', 'Lora', 'Inter'].map(family => `@font-face { font-family: '${family}'; font-weight: 400; src: url('/font-${family.replaceAll(' ', '-')}.woff2') format('woff2'); unicode-range: U+0000-00FF,U+1E00-1EFF; }`).join('\n')
  document.head.append(style)
  // jsdom's CSS parser currently drops the @font-face src descriptor. Supply
  // that browser descriptor only; keep real stylesheet traversal/embedding.
  Array.from(style.sheet!.cssRules).forEach((rule, index) => {
    const face = rule as CSSFontFaceRule
    const family = ['Bodoni Moda', 'Lora', 'Inter'][index]
    const src = `url('/font-${family.replaceAll(' ', '-')}.woff2') format('woff2')`
    const get = face.style.getPropertyValue.bind(face.style)
    vi.spyOn(face.style, 'getPropertyValue').mockImplementation(name => name === 'src' ? src : get(name))
    Object.defineProperty(face, 'cssText', { value: `@font-face { font-family: '${family}'; src: ${src}; unicode-range: U+0000-00FF,U+1E00-1EFF; }` })
  })
}
it('embeds actual font bytes and preserves Vietnamese unicode ranges', async () => {
  faces()
  vi.stubGlobal('fetch', async () => ({ ok: true, blob: async () => new Blob(['font bytes'], { type: 'font/woff2' }) }))
  const css = await embedProposalFonts(document)
  expect(css).toContain('data:font/woff2;base64,')
  expect(css).toContain('U+1E00-1EFF')
  expect(css).not.toContain('/font-')
})
it('refuses font embedding failure instead of leaving a remote URL in the capture', async () => {
  faces()
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 404 }))
  await expect(embedProposalFonts(document)).rejects.toThrow(/font/i)
})
it('refuses missing registered faces', async () => {
  await expect(embedProposalFonts(document)).rejects.toThrow(/font/i)
})
