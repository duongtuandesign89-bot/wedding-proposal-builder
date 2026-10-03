import { act, renderHook } from '@testing-library/react'
import { demoProposal } from '../data/demoProposal'
import { useProposalEditor } from './useProposalEditor'

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

describe('proposal data boundaries', () => {
  it('keeps optional text updates immutable and serializable with guarded list moves', () => {
    const initial = freeze(structuredClone(demoProposal))
    const { result } = renderHook(() => useProposalEditor(initial))
    act(() => {
      result.current.updateIntroduction({ enabled: true, text: 'Cảm ơn\nHai bạn.' })
      result.current.updateContact({ email: 'hello@example.com', address: 'Trà Vinh' })
      result.current.addTextItem('notes')
      result.current.updateTextItem('notes', 2, 'Ghi chú mới')
      result.current.moveTextItem('notes', 2, -1)
      result.current.moveTextItem('notes', 0, -1)
      result.current.moveTextItem('terms', 1, 1)
      result.current.setTextSectionEnabled('terms', false)
    })
    expect(result.current.proposal.notes.items[1]).toBe('Ghi chú mới')
    act(() => result.current.moveTextItem('notes', 1, 1))
    expect(result.current.proposal.notes.items[2]).toBe('Ghi chú mới')
    expect(initial.introduction.enabled).toBe(false)
    expect(initial.notes.items).toHaveLength(2)
    expect(result.current.proposal.terms.items).toEqual(initial.terms.items)
    expect(JSON.parse(JSON.stringify(result.current.proposal))).toEqual(result.current.proposal)
  })
  it('keeps unique stable IDs through rename/reorder and deletes only the selected duplicate', () => {
    const { result } = renderHook(() => useProposalEditor({ ...demoProposal, events: [] }))
    act(() => { result.current.addEvent(); result.current.addEvent() })
    const [first, second] = result.current.proposal.events
    expect(first.id).not.toBe(second.id)
    act(() => {
      result.current.updateEvent(first.id, { name: 'Lễ cưới' })
      result.current.updateEvent(second.id, { name: 'Lễ cưới' })
      result.current.moveEvent(second.id, -1)
    })
    expect(result.current.proposal.events.map(event => event.id)).toEqual([second.id, first.id])
    act(() => result.current.removeEvent(first.id))
    expect(result.current.proposal.events.map(event => event.id)).toEqual([second.id])
  })

  it('updates nested data without mutating frozen previous state and stays JSON serializable', () => {
    const initial = freeze(structuredClone(demoProposal))
    const { result } = renderHook(() => useProposalEditor(initial))
    act(() => {
      result.current.updateCouple('brideName', 'Ánh')
      result.current.updateGeneral('location', 'Đà Lạt')
      result.current.updateEvent('vu-quy', { location: 'Hà Nội' })
      result.current.updateService('vu-quy', 'vu-quy-photo', { price: 6000000, description: 'Hai nhiếp ảnh gia' })
      result.current.addAdjustment()
    })
    expect(initial.events[0].services[0].price).toBe(4500000)
    expect(initial.couple.brideName).toBe('Ngọc')
    expect(result.current.proposal.events[0].services[0].price).toBe(6000000)
    expect(JSON.parse(JSON.stringify(result.current.proposal))).toEqual(result.current.proposal)
    expect(result.current.proposal).not.toHaveProperty('total')
    expect(result.current.proposal).not.toHaveProperty('collapsed')
  })

  it('isolates services and adjustments with duplicate names and normalizes invalid amounts', () => {
    const { result } = renderHook(() => useProposalEditor(structuredClone(demoProposal)))
    act(() => {
      result.current.addService('vu-quy')
      result.current.addService('vu-quy')
      result.current.addAdjustment()
      result.current.addAdjustment()
    })
    const [first, second] = result.current.proposal.events[0].services.slice(-2)
    const [fee, discount] = result.current.proposal.adjustments
    expect(new Set([first.id, second.id, fee.id, discount.id]).size).toBe(4)
    act(() => {
      result.current.updateService('vu-quy', second.id, { price: NaN })
      result.current.removeService('vu-quy', first.id)
      result.current.updateAdjustment(discount.id, { amount: -1000000 })
      result.current.updateAdjustment(fee.id, { amount: Infinity })
    })
    expect(result.current.proposal.events[0].services.at(-1)).toMatchObject({ id: second.id, price: 0 })
    expect(result.current.proposal.adjustments.map(item => item.amount)).toEqual([0, -1000000])
    act(() => result.current.removeAdjustment(fee.id))
    expect(result.current.proposal.adjustments).toEqual([{ ...discount, amount: -1000000 }])
  })

  it('ignores out-of-bounds reorder without changing the proposal', () => {
    const { result } = renderHook(() => useProposalEditor(demoProposal))
    act(() => { result.current.moveEvent('vu-quy', -1); result.current.moveEvent('thanh-hon', 1); result.current.moveEvent('missing', 1) })
    expect(result.current.proposal).toBe(demoProposal)
  })
})
