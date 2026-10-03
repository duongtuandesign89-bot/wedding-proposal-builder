import { calculateCropGeometry, clampCrop, moveCrop } from './heroCrop'

describe('Hero crop geometry', () => {
  it('centers a cover image with deterministic dimensions', () => {
    const geometry = calculateCropGeometry(1600, 900, 400, 300, { positionX: 50, positionY: 50, zoom: 1 })
    expect(geometry.width).toBeCloseTo(533.333333)
    expect(geometry.height).toBe(300)
    expect(geometry.left).toBeCloseTo(-66.666667)
    expect(geometry.top).toBe(-0)
    expect(geometry.overflowY).toBe(0)
  })
  it('preserves normalized composition at different renderer sizes', () => {
    const crop = { positionX: 25, positionY: 80, zoom: 2 }
    const small = calculateCropGeometry(1200, 1600, 400, 300, crop)
    const large = calculateCropGeometry(1200, 1600, 1080, 810, crop)
    for (const key of ['width', 'height', 'left', 'top'] as const) expect(large[key] / 2.7).toBeCloseTo(small[key])
    expect(small.left).toBe(-100)
    expect(small.top).toBeCloseTo(-613.333333)
  })
  it('clamps coordinates/zoom and defaults nonfinite values', () => {
    expect(clampCrop({ positionX: -100, positionY: 200, zoom: 4 })).toEqual({ positionX: 0, positionY: 100, zoom: 2.5 })
    expect(clampCrop({ positionX: NaN, positionY: Infinity, zoom: -1 })).toEqual({ positionX: 50, positionY: 50, zoom: 1 })
  })
  it('moves the image in pointer direction using real overflow and clamps edges', () => {
    expect(moveCrop({ positionX: 50, positionY: 50, zoom: 2 }, 30, -60, 200, 300))
      .toEqual({ positionX: 35, positionY: 70, zoom: 2 })
    expect(moveCrop({ positionX: 50, positionY: 50, zoom: 1 }, 500, 500, 0, 200))
      .toEqual({ positionX: 50, positionY: 0, zoom: 1 })
  })
})
