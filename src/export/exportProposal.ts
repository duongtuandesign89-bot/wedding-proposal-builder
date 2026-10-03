import { createContext, destroyContext, domToCanvas } from 'modern-screenshot'
import type { Proposal } from '../types/proposal'
import { createProposalFilename } from '../utils/createProposalFilename'
import { mountExportProposal } from './ExportProposalRenderer'
import { prepareExport } from './prepareExport'
import { embedProposalFonts } from './embedProposalFonts'
import { downloadBlob } from './downloadBlob'
import { calculateExportDimensions, EXPORT_BACKGROUND, ExportSizeError, type ExportOptions } from './exportOptions'
import { ExportDiagnosticError, type ExportStage } from './ExportDiagnosticError'

function encodeCanvas(canvas: HTMLCanvasElement, format: ExportOptions['format']): Promise<Blob> {
  const type = format === 'jpg' ? 'image/jpeg' : 'image/png'
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Export encoding timed out')), 20_000)
    try {
      canvas.toBlob(blob => {
        clearTimeout(timer)
        if (!blob || !blob.size || blob.type !== type) reject(new Error('Export encoding failed'))
        else resolve(blob)
      }, type, format === 'jpg' ? 0.92 : undefined)
    } catch (error) { clearTimeout(timer); reject(error) }
  })
}

export async function exportProposal(proposal: Proposal, options: ExportOptions, heroBlob?: Blob | null): Promise<void> {
  let renderer: ReturnType<typeof mountExportProposal>
  try { renderer = mountExportProposal(proposal, heroBlob) }
  catch (cause) { throw new ExportDiagnosticError('MOUNT', cause) }
  let stage: ExportStage = 'PREPARE'
  let context: Awaited<ReturnType<typeof createContext>> | null = null
  let canvas: HTMLCanvasElement | null = null
  try {
    await prepareExport(renderer.element)
    stage = 'MEASURE'
    const logicalHeight = Math.max(renderer.element.getBoundingClientRect().height, renderer.element.scrollHeight)
    const dimensions = calculateExportDimensions(logicalHeight, options.quality)
    stage = 'FONTS'
    const embeddedFonts = await embedProposalFonts(renderer.element.ownerDocument)
    stage = 'CONTEXT'
    context = await createContext(renderer.element, {
      width: 1080,
      // Library floors scaled dimensions; a fractional background-only pad
      // makes the requested ceil height exact without cutting off the last row.
      height: (dimensions.height + 0.01) / dimensions.scale,
      scale: dimensions.scale,
      backgroundColor: EXPORT_BACKGROUND,
      maximumCanvasSize: 0, // Never allow the library to silently downscale.
      timeout: 20_000,
      font: { cssText: embeddedFonts },
      fetch: { placeholderImage: () => { throw new Error('Export image embedding failed') } },
    })
    stage = 'CAPTURE'
    canvas = await domToCanvas(context)
    stage = 'VALIDATE'
    if (canvas.width !== dimensions.width || canvas.height !== dimensions.height) throw new Error('Export canvas dimensions do not match the full document')
    const paint = canvas.getContext('2d')
    if (!paint) throw new Error('Export canvas unavailable or incomplete on this browser')
    // Safari's SVG decode retries clear the library's prepainted background.
    // Restore it behind the captured pixels, not over the proposal content.
    paint.save()
    try {
      paint.globalCompositeOperation = 'destination-over'
      paint.fillStyle = EXPORT_BACKGROUND
      paint.fillRect(0, 0, canvas.width, canvas.height)
    } finally { paint.restore() }
    const pixels = paint.getImageData(0, canvas.height - 1, 1, 1)
    if (!pixels || pixels.data[3] !== 255) throw new Error('Export canvas unavailable or incomplete on this browser')
    // The library can catch drawImage errors and return its prepainted opaque
    // background. Verify the mandatory white studio mark was actually drawn.
    const logo = renderer.element.querySelector('.hero-brand img')!.getBoundingClientRect()
    const bounds = renderer.element.getBoundingClientRect()
    const x = Math.max(0, Math.floor((logo.left - bounds.left) * dimensions.scale))
    const y = Math.max(0, Math.floor((logo.top - bounds.top) * dimensions.scale))
    const width = Math.min(canvas.width - x, Math.ceil(logo.width * dimensions.scale))
    const height = Math.min(canvas.height - y, Math.ceil(logo.height * dimensions.scale))
    if (width <= 0 || height <= 0) throw new Error('Export render has invalid logo bounds')
    const mark = paint.getImageData(x, y, width, height).data
    let drawn = false
    for (let index = 0; index < mark.length; index += 4) {
      if (Math.max(mark[index], mark[index + 1], mark[index + 2]) > 128) { drawn = true; break }
    }
    if (!drawn) throw new Error('Export render is blank or incomplete')
    stage = 'ENCODE'
    const blob = await encodeCanvas(canvas, options.format)
    stage = 'DOWNLOAD'
    downloadBlob(blob, createProposalFilename(proposal, options.format))
  } catch (cause) {
    if (cause instanceof ExportSizeError) throw cause
    throw new ExportDiagnosticError(stage, cause)
  } finally {
    if (canvas) { canvas.width = 0; canvas.height = 0 }
    if (context) destroyContext(context)
    renderer.dispose()
  }
}
