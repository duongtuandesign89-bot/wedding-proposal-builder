import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { HeroImage } from '../types/proposal'
import { PositionedImage } from '../proposal/PositionedImage'
import type { ImageDimensions } from '../proposal/PositionedImage'
import { calculateCropGeometry, clampCrop, DEFAULT_HERO_IMAGE, HERO_FRAME_ASPECT_RATIO, moveCrop } from '../utils/heroCrop'
import { useLocalHeroImage } from './useLocalHeroImage'
import { EditorGroup } from './EditorGroup'

interface DragStart {
  pointerId: number; x: number; y: number; crop: HeroImage; overflowX: number; overflowY: number
}

export function HeroImageEditor({ image, onChange, onAssetChange }: { image: HeroImage; onChange: (patch: Partial<HeroImage>) => void; onAssetChange?: (image: HeroImage, file: File | null) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const drag = useRef<DragStart | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null)
  useEffect(() => { drag.current = null; setDragging(false) }, [image.src])
  const localImage = useLocalHeroImage((next, file) => {
    if (onAssetChange) onAssetChange(next, file ?? null)
    else onChange(next)
  })
  const custom = image.src !== DEFAULT_HERO_IMAGE.src
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0 || dimensions?.src !== image.src) return
    const frame = event.currentTarget.getBoundingClientRect()
    const geometry = calculateCropGeometry(dimensions.width, dimensions.height, frame.width, frame.height, image)
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, crop: image, overflowX: geometry.overflowX, overflowY: geometry.overflowY }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus()
    event.preventDefault()
    setDragging(true)
  }
  const stopDrag = () => { drag.current = null; setDragging(false) }
  return <EditorGroup number="05" title="Hero Image"><div className="hero-image-editor">
    <input ref={input} type="file" hidden aria-label="Chọn ảnh Hero" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      onChange={event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) { stopDrag(); void localImage.selectFile(file) }
      }} />
    <div className={`hero-crop-preview${dragging ? ' is-dragging' : ''}`} role="group" aria-label="Điều chỉnh ảnh Hero" aria-describedby="hero-crop-help" tabIndex={0}
      onPointerDown={startDrag}
      onPointerMove={event => {
        const start = drag.current
        if (start && start.crop.src !== image.src) { stopDrag(); return }
        if (start?.pointerId === event.pointerId) {
          event.preventDefault()
          onChange(moveCrop(start.crop, event.clientX - start.x, event.clientY - start.y, start.overflowX, start.overflowY))
        }
      }}
      onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={stopDrag}
      onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
        event.preventDefault()
        const step = event.shiftKey ? 5 : 1
        onChange(clampCrop({ ...image,
          positionX: image.positionX + (event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0),
          positionY: image.positionY + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0),
        }))
      }}>
      <PositionedImage {...image} alt="Ảnh Hero đang chỉnh" frameAspectRatio={HERO_FRAME_ASPECT_RATIO} onDimensions={setDimensions} />
    </div>
    <p className="editor-help" id="hero-crop-help">Kéo ảnh để chỉnh vị trí. Dùng phím mũi tên khi khung ảnh được chọn; Shift để di chuyển nhanh hơn.</p>
    <div className="hero-zoom-control">
      <label htmlFor="hero-zoom">Zoom</label>
      <input id="hero-zoom" type="range" min="1" max="2.5" step="0.01" value={image.zoom} aria-valuetext={`${Math.round(image.zoom * 100)}%`}
        onChange={event => { stopDrag(); onChange({ zoom: Number(event.target.value) }) }} />
      <output htmlFor="hero-zoom">{Math.round(image.zoom * 100)}%</output>
    </div>
    <div className="hero-image-actions">
      <button type="button" className="editor-action" onClick={() => { stopDrag(); onChange({ positionX: 50, positionY: 50, zoom: 1 }) }}>Đặt lại</button>
      <button type="button" className="editor-action" onClick={() => input.current?.click()}>{custom ? 'Thay ảnh' : 'Chọn ảnh'}</button>
      {custom && <button type="button" className="editor-action" onClick={() => { stopDrag(); localImage.removeImage() }}>Xóa ảnh</button>}
    </div>
    {localImage.loading && <p className="editor-help" role="status">Đang đọc ảnh…</p>}
    {localImage.error && <p className="editor-image-error" role="alert">{localImage.error}</p>}
    {localImage.warning && <p className="editor-help" role="status">{localImage.warning}</p>}
  </div></EditorGroup>
}
