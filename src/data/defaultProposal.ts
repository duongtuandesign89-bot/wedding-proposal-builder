import type { Proposal } from '../types/proposal'
import { createId } from '../utils/id'
import { DEFAULT_HERO_IMAGE } from '../utils/heroCrop'

export function createDefaultProposal(): Proposal {
  return {
    id: createId(), title: 'The Wedding Story', couple: { brideName: '', groomName: '' }, weddingDate: '', location: '',
    events: [{ id: createId(), name: 'Lễ Thành Hôn', date: '', startTime: '', endTime: '', location: '', services: [
      { id: createId(), name: 'Photography', description: '', price: 0 },
      { id: createId(), name: 'Wedding Film', description: '', price: 0 },
    ] }], adjustments: [], introduction: { enabled: false, text: '' },
    notes: { enabled: true, items: ['File ảnh được bàn giao qua link online.', 'Chi phí phát sinh được xác nhận riêng.'] },
    terms: { enabled: true, items: ['Đặt cọc 30% để xác nhận lịch.', 'Thời gian bàn giao ảnh dự kiến 30 ngày.'] },
    contact: { enabled: true, studioName: 'Solis Studio', phone: '' }, settings: { currency: 'VND', locale: 'vi-VN' }, heroImage: { ...DEFAULT_HERO_IMAGE },
  }
}
