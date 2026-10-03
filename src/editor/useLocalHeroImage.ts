import { useEffect, useRef, useState } from 'react'
import type { HeroImage } from '../types/proposal'
import { DEFAULT_HERO_IMAGE } from '../utils/heroCrop'

function isSupportedImage(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())
    || (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name))
}

function readDimensions(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      image.onload = image.onerror = null
      if (image.naturalWidth > 0 && image.naturalHeight > 0) resolve()
      else reject(new Error('Invalid image'))
    }
    image.onerror = () => { image.onload = image.onerror = null; reject(new Error('Invalid image')) }
    image.src = src
  })
}

// Own browser resources here, never put File objects into Proposal JSON.
export function useLocalHeroImage(onChange: (image: HeroImage) => void) {
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const urls = useRef(new Set<string>())
  const activeUrl = useRef<string | null>(null)
  const request = useRef(0)
  const change = useRef(onChange)
  change.current = onChange
  const release = (src: string) => {
    if (urls.current.delete(src)) URL.revokeObjectURL(src)
  }
  const releasePending = () => {
    for (const src of urls.current) if (src !== activeUrl.current) release(src)
  }
  useEffect(() => () => {
    request.current++
    for (const src of urls.current) URL.revokeObjectURL(src)
    urls.current.clear()
    activeUrl.current = null
  }, [])

  const selectFile = async (file: File) => {
    const currentRequest = ++request.current
    releasePending()
    setError('')
    setWarning('')
    setLoading(false)
    if (!isSupportedImage(file)) { setError('File ảnh không hợp lệ.'); return }
    let src: string | undefined
    try {
      src = URL.createObjectURL(file)
      urls.current.add(src)
      setLoading(true)
      await readDimensions(src)
      if (request.current !== currentRequest) { release(src); return }
      const previous = activeUrl.current
      activeUrl.current = src
      change.current({ ...DEFAULT_HERO_IMAGE, src })
      if (previous) release(previous)
      setWarning(file.size > 30 * 1024 * 1024 ? 'Ảnh có dung lượng lớn, trình duyệt có thể xử lý chậm.' : '')
    } catch {
      if (src) release(src)
      if (request.current === currentRequest) setError('File ảnh không hợp lệ.')
    } finally {
      if (request.current === currentRequest) setLoading(false)
    }
  }
  const removeImage = () => {
    request.current++
    change.current({ ...DEFAULT_HERO_IMAGE })
    for (const src of urls.current) release(src)
    activeUrl.current = null
    setLoading(false); setError(''); setWarning('')
  }
  return { selectFile, removeImage, loading, error, warning }
}
