import type { Introduction } from '../types/proposal'

export function IntroductionSection({ introduction }: { introduction: Introduction }) {
  if (!introduction.enabled || !introduction.text.trim()) return null
  return <section className="proposal-introduction" aria-label="Lời giới thiệu"><p>{introduction.text}</p></section>
}
