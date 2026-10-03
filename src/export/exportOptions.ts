export type ExportFormat = 'jpg' | 'png'
export type ExportQuality = 'standard' | 'high'
export interface ExportOptions { format: ExportFormat; quality: ExportQuality }
export const EXPORT_WIDTHS = { standard: 1080, high: 1440 } as const
export const EXPORT_BACKGROUND = '#11110f'
// Bound both allocation and SVG/canvas dimensions conservatively. A device
// with a smaller limit is caught again by canvas validation/encoding.
export const MAX_EXPORT_PIXELS = 16_777_216
export const MAX_EXPORT_SIDE = 16_384
export class ExportSizeError extends Error {
  constructor() {
    super('Báo giá quá dài để xuất thành một ảnh duy nhất. Hãy giảm nội dung hoặc sử dụng định dạng khác.')
    this.name = 'ExportSizeError'
  }
}
export function calculateExportDimensions(logicalHeight: number, quality: ExportQuality) {
  const width = EXPORT_WIDTHS[quality]
  const scale = width / 1080
  const height = Math.ceil(logicalHeight * scale)
  if (!Number.isFinite(height) || height <= 0 || height > MAX_EXPORT_SIDE || width * height > MAX_EXPORT_PIXELS) throw new ExportSizeError()
  return { width, height, scale }
}
