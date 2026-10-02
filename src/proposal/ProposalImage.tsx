export interface ProposalImageProps {
  src: string
  alt: string
  positionX?: number
  positionY?: number
  zoom?: number
}

export function ProposalImage({ src, alt, positionX = 50, positionY = 45, zoom = 1 }: ProposalImageProps) {
  const x = Math.min(100, Math.max(0, positionX))
  const y = Math.min(100, Math.max(0, positionY))
  return (
    <div className="proposal-image">
      <img src={src} alt={alt} style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${Math.max(1, zoom)})`, transformOrigin: `${x}% ${y}%` }} />
    </div>
  )
}
