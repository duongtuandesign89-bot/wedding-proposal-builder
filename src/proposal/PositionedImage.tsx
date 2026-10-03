import { useState } from 'react'
import type { HeroImage } from '../types/proposal'
import { calculateCropGeometry, clampCrop, HERO_FRAME_ASPECT_RATIO } from '../utils/heroCrop'

export interface ImageDimensions { src: string; width: number; height: number }

export function PositionedImage({ src, alt, positionX, positionY, zoom, frameAspectRatio = HERO_FRAME_ASPECT_RATIO, onDimensions }: HeroImage & {
  alt: string
  frameAspectRatio?: number
  onDimensions?: (dimensions: ImageDimensions) => void
}) {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  const crop = clampCrop({ positionX, positionY, zoom })
  const geometry = dimensions?.src === src ? calculateCropGeometry(dimensions.width, dimensions.height, frameAspectRatio, 1, crop) : null
  return <div className="proposal-image" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
    <img src={src} alt={alt} draggable={false}
      onLoad={event => {
        const image = event.currentTarget
        const next = { src, width: image.naturalWidth, height: image.naturalHeight }
        setDimensions(next)
        onDimensions?.(next)
      }}
      style={geometry ? {
        position: 'absolute', maxWidth: 'none', width: `${geometry.width / frameAspectRatio * 100}%`, height: `${geometry.height * 100}%`,
        left: `${geometry.left / frameAspectRatio * 100}%`, top: `${geometry.top * 100}%`, objectFit: 'fill',
      } : {
        display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${crop.positionX}% ${crop.positionY}%`,
        transform: `scale(${crop.zoom})`, transformOrigin: `${crop.positionX}% ${crop.positionY}%`,
      }} />
  </div>
}
