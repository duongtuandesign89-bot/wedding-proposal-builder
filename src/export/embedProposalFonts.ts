const FAMILIES = ['Bodoni Moda', 'Lora', 'Inter']

/** Capture libraries may swallow failed @font-face fetches. Embed our locally
    registered fonts explicitly so an incomplete font never becomes success. */
export async function embedProposalFonts(doc: Document): Promise<string> {
  const faces: { css: string; src: string; base: string }[] = []
  const families = new Set<string>()
  const visit = (sheet: CSSStyleSheet) => {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { return } // Unused remote Editor imports.
    for (const rule of Array.from(rules)) {
      if (rule.type === CSSRule.IMPORT_RULE) { const imported = (rule as CSSImportRule).styleSheet; if (imported) visit(imported) }
      if (rule.type !== CSSRule.FONT_FACE_RULE) continue
      const face = rule as CSSFontFaceRule
      const family = face.style.getPropertyValue('font-family').replace(/['"]/g, '').trim()
      if (!FAMILIES.includes(family)) continue
      const src = face.style.getPropertyValue('src').match(/url\(["']?([^"')]+)["']?\)/)?.[1]
      if (!src) throw new Error(`Export font source missing: ${family}`)
      families.add(family)
      faces.push({ css: face.cssText, src, base: sheet.href || doc.baseURI })
    }
  }
  Array.from(doc.styleSheets).forEach(visit)
  if (FAMILIES.some(family => !families.has(family))) throw new Error('Export font faces missing')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20_000)
  try {
    const embedded = await Promise.all(faces.map(async face => {
      const response = await fetch(new URL(face.src, face.base).href, { signal: controller.signal })
      if (!response.ok) throw new Error(`Export font fetch failed: ${response.status}`)
      const blob = await response.blob()
      if (!blob.size) throw new Error('Export font file empty')
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Export font embedding failed'))
        reader.readAsDataURL(blob)
      })
      // Prefer the first (woff2) source, remove all external fallback URLs.
      return face.css.replace(/src\s*:[^;]+;/i, `src: url("${data}") format("woff2");`)
    }))
    return embedded.join('\n')
  } catch (error) { controller.abort(); throw error }
  finally { clearTimeout(timer) }
}
