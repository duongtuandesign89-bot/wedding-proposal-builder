import type { HeroImage } from '../types/proposal'

export type Crop = Pick<HeroImage, 'positionX' | 'positionY' | 'zoom'>
export const HERO_FRAME_ASPECT_RATIO = 4 / 3
export const DEFAULT_HERO_IMAGE: HeroImage = {
  src: '/assets/solis-wedding-details-cover.png', positionX: 50, positionY: 50, zoom: 1,
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

export function clampCrop(crop: Crop): Crop {
  return {
    positionX: clamp(crop.positionX, 0, 100, 50),
    positionY: clamp(crop.positionY, 0, 100, 50),
    zoom: clamp(crop.zoom, 1, 2.5, 1),
  }
}

export function calculateCropGeometry(imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number, crop: Crop) {
  const { positionX, positionY, zoom } = clampCrop(crop)
  const ratio = imageWidth > 0 && imageHeight > 0 ? imageWidth / imageHeight : frameWidth / frameHeight
  const width = Math.max(frameWidth, frameHeight * ratio) * zoom
  const height = width / ratio
  const overflowX = Math.max(0, width - frameWidth)
  const overflowY = Math.max(0, height - frameHeight)
  return { width, height, left: -overflowX * positionX / 100, top: -overflowY * positionY / 100, overflowX, overflowY }
}

export function moveCrop(crop: Crop, deltaX: number, deltaY: number, overflowX: number, overflowY: number): Crop {
  return clampCrop({
    ...crop,
    positionX: crop.positionX - (overflowX > .001 ? deltaX / overflowX * 100 : 0),
    positionY: crop.positionY - (overflowY > .001 ? deltaY / overflowY * 100 : 0),
  })
}
