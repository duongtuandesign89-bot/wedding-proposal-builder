import { describe, expect, it } from 'vitest'
import { calculateExportDimensions, ExportSizeError } from './exportOptions'

describe('export dimensions', () => {
  it.each([2500, 4000, 6000])('keeps a %ipx continuous document at standard resolution', height => {
    expect(calculateExportDimensions(height, 'standard')).toEqual({ width: 1080, height, scale: 1 })
  })
  it('scales high quality without changing the canonical composition', () => {
    expect(calculateExportDimensions(4200, 'high')).toEqual({ width: 1440, height: 5600, scale: 4 / 3 })
    expect(calculateExportDimensions(2500.25, 'high').height).toBe(3334)
  })
  it.each([0, -1, NaN, Infinity, 20000])('refuses invalid or unsafe logical height %s', height => {
    expect(() => calculateExportDimensions(height, 'standard')).toThrow(ExportSizeError)
  })
  it('refuses high quality when the pixel area would exceed the memory budget', () => {
    expect(() => calculateExportDimensions(10000, 'high')).toThrow(ExportSizeError)
    expect(calculateExportDimensions(10000, 'standard').height).toBe(10000)
  })
})
