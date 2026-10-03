import type { Proposal } from '../types/proposal'
import { PositionedImage } from './PositionedImage'

export function HeroSection({ proposal }: { proposal: Proposal }) {
  const heroRef = useRef<HTMLElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const hero = heroRef.current
    if (!hero || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      if (hero.clientWidth) setScale(hero.clientWidth / 1080)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(hero)
    measure()
    return () => observer.disconnect()
  }, [])
  const nameLength = proposal.couple.brideName.length + proposal.couple.groomName.length + 3
  const nameSize = Math.max(32, Math.min(48, 48 * 24 / Math.max(24, nameLength)))
  return (
    <header className="proposal-hero" ref={heroRef}>
      <div className="hero-cover" style={{ transform: `scale(${scale})` }}>
        <figure className="hero-photograph">
          <PositionedImage {...proposal.heroImage} alt={`${proposal.couple.brideName} and ${proposal.couple.groomName} wedding cover`} />
        </figure>
        <div className="hero-cover-type">
          <div className="hero-masthead">
            <div className="hero-brand"><img src="/assets/solis-logo-white.png" alt={proposal.settings.studioName} /></div>
            <span className="hero-issue-label">Wedding proposal</span>
          </div>
          <div className="hero-heading">
            <h2 aria-label={proposal.title.toLocaleUpperCase('vi-VN')}>{proposal.title.trim().split(/\s+/).map((word, index) => <span key={index}>{word.toLocaleUpperCase('vi-VN')}{' '}</span>)}</h2>
            <p>Ảnh &amp; phim / Ngày cưới</p>
          </div>
          <div className="hero-couple">
            <strong data-testid="cover-couple" style={{ fontSize: nameSize }}>
              <span>{proposal.couple.brideName.toLocaleUpperCase('vi-VN')}</span>{' '}
              <span className="couple-ampersand">&amp;</span>{' '}
              <span>{proposal.couple.groomName.toLocaleUpperCase('vi-VN')}</span>
            </strong>
            <div className="couple-details"><p>{proposal.weddingDate}</p><p>{proposal.location}</p></div>
          </div>
        </div>
      </div>
    </header>
  )
}
import { useLayoutEffect, useRef, useState } from 'react'
