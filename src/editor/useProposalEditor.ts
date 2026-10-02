import { useState } from 'react'
import type { Adjustment, Couple, Proposal, ServiceItem, WeddingEvent } from '../types/proposal'
import { normalizeAmount, normalizeSignedAmount } from '../utils/currency'

let fallbackId = 0
function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `quote-${Date.now()}-${++fallbackId}`
}

export function useProposalEditor(initialProposal: Proposal) {
  const [proposal, setProposal] = useState(initialProposal)
  const updateCouple = (field: keyof Couple, value: string) => setProposal(current => ({
    ...current, couple: { ...current.couple, [field]: value },
  }))
  const updateGeneral = (field: 'title' | 'weddingDate' | 'location', value: string) =>
    setProposal(current => ({ ...current, [field]: value }))
  const updateEvent = (id: string, patch: Partial<Omit<WeddingEvent, 'id' | 'services'>>) =>
    setProposal(current => ({ ...current, events: current.events.map(event => event.id === id ? { ...event, ...patch } : event) }))
  const addEvent = () => {
    const event: WeddingEvent = { id: createId(), name: 'Sự kiện mới', date: '', startTime: '', endTime: '', location: '', services: [] }
    setProposal(current => ({ ...current, events: [...current.events, event] }))
    return event.id
  }
  const removeEvent = (id: string) => setProposal(current => ({ ...current, events: current.events.filter(event => event.id !== id) }))
  const moveEvent = (id: string, direction: -1 | 1) => setProposal(current => {
    const index = current.events.findIndex(event => event.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= current.events.length) return current
    const events = [...current.events]
    ;[events[index], events[target]] = [events[target], events[index]]
    return { ...current, events }
  })
  const updateServices = (eventId: string, update: (services: ServiceItem[]) => ServiceItem[]) =>
    setProposal(current => ({ ...current, events: current.events.map(event => event.id === eventId ? { ...event, services: update(event.services) } : event) }))
  const addService = (eventId: string) => {
    const service: ServiceItem = { id: createId(), name: 'Dịch vụ mới', description: '', price: 0 }
    updateServices(eventId, services => [...services, service])
    return service.id
  }
  const updateService = (eventId: string, id: string, patch: Partial<Omit<ServiceItem, 'id'>>) => {
    const normalized = patch.price === undefined ? patch : { ...patch, price: normalizeAmount(patch.price) }
    updateServices(eventId, services => services.map(service => service.id === id ? { ...service, ...normalized } : service))
  }
  const removeService = (eventId: string, id: string) => updateServices(eventId, services => services.filter(service => service.id !== id))
  const addAdjustment = () => {
    const adjustment: Adjustment = { id: createId(), name: 'Điều chỉnh mới', amount: 0 }
    setProposal(current => ({ ...current, adjustments: [...current.adjustments, adjustment] }))
  }
  const updateAdjustment = (id: string, patch: Partial<Omit<Adjustment, 'id'>>) => {
    const normalized = patch.amount === undefined ? patch : { ...patch, amount: normalizeSignedAmount(patch.amount) }
    setProposal(current => ({ ...current, adjustments: current.adjustments.map(item => item.id === id ? { ...item, ...normalized } : item) }))
  }
  const removeAdjustment = (id: string) => setProposal(current => ({ ...current, adjustments: current.adjustments.filter(item => item.id !== id) }))
  return { proposal, updateCouple, updateGeneral, updateEvent, addEvent, removeEvent, moveEvent, addService, updateService, removeService, addAdjustment, updateAdjustment, removeAdjustment }
}

export type ProposalEditorActions = Omit<ReturnType<typeof useProposalEditor>, 'proposal'>
