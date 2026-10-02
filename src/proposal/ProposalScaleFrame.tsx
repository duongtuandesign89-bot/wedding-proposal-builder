import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { PROPOSAL_DESIGN_WIDTH } from './ProposalDocument'

/** Desktop scales the document; mobile reads content at native CSS size. */
export function ProposalScaleFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ scale: 1, height: 0 })

  useLayoutEffect(() => {
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content || typeof ResizeObserver === 'undefined') return

    const mobile = window.matchMedia('(max-width: 900px)')
    const measure = () => {
      const width = frame.clientWidth
      if (!width) return // A hidden mobile tab is measured again when it becomes visible.
      const scale = mobile.matches ? 1 : Math.min(1, width / PROPOSAL_DESIGN_WIDTH)
      const height = content.offsetHeight * scale
      setDimensions((previous) => previous.scale === scale && previous.height === height ? previous : { scale, height })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    observer.observe(content)
    mobile.addEventListener('change', measure)
    measure()
    return () => {
      observer.disconnect()
      mobile.removeEventListener('change', measure)
    }
  }, [])

  return (
    <div className="proposal-scale-frame" ref={frameRef} style={{ height: dimensions.height || undefined }}>
      <div className="proposal-scale-content" ref={contentRef} style={{ transform: `scale(${dimensions.scale})` }}>
        {children}
      </div>
    </div>
  )
}
