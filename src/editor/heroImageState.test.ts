import { act, renderHook } from '@testing-library/react'
import { demoProposal } from '../data/demoProposal'
import { useProposalEditor } from './useProposalEditor'

describe('serializable Hero crop state', () => {
  it('clamps position and zoom while preserving serializable image data', () => {
    const { result } = renderHook(() => useProposalEditor(demoProposal))
    act(() => result.current.updateHeroImage({ src: 'blob:local-photo', positionX: -20, positionY: 120, zoom: 8 }))
    expect(result.current.proposal.heroImage).toEqual({ src: 'blob:local-photo', positionX: 0, positionY: 100, zoom: 2.5 })
    act(() => result.current.updateHeroImage({ zoom: .5 }))
    expect(result.current.proposal.heroImage.zoom).toBe(1)
    expect(JSON.parse(JSON.stringify(result.current.proposal)).heroImage).toEqual(result.current.proposal.heroImage)
    expect(demoProposal.heroImage).toMatchObject({ positionX: 50, positionY: 50, zoom: 1 })
  })
})
