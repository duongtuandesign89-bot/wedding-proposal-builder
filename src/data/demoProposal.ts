import type { Proposal } from '../types/proposal'
import { DEFAULT_HERO_IMAGE } from '../utils/heroCrop'

export const demoProposal: Proposal = {
  id: 'solis-ngoc-huy-2026',
  title: 'The Wedding Story',
  couple: {
    brideName: 'Ngọc',
    groomName: 'Huy',
  },
  weddingDate: '12 — 13 December 2026',
  location: 'Trà Vinh · Ho Chi Minh City',
  events: [
    {
      id: 'vu-quy',
      name: 'Lễ Vu Quy',
      date: '12 December 2026',
      startTime: '06:00',
      endTime: '11:00',
      location: 'Trà Vinh',
      services: [
        {
          id: 'vu-quy-photo',
          name: 'Photography',
          description: '',
          price: 4_500_000,
        },
        {
          id: 'vu-quy-film',
          name: 'Wedding Film',
          description: '',
          price: 4_000_000,
        },
      ],
    },
    {
      id: 'thanh-hon',
      name: 'Lễ Thành Hôn',
      date: '13 December 2026',
      startTime: '14:00',
      endTime: '21:00',
      location: 'Ho Chi Minh City',
      services: [
        {
          id: 'thanh-hon-photo',
          name: 'Photography',
          description: '',
          price: 5_500_000,
        },
        {
          id: 'thanh-hon-film',
          name: 'Wedding Film',
          description: '',
          price: 5_000_000,
        },
        {
          id: 'thanh-hon-flycam',
          name: 'Flycam',
          price: 1_500_000,
        },
        {
          id: 'thanh-hon-travel',
          name: 'Travel Fee',
          price: 1_500_000,
        },
      ],
    },
  ],
  adjustments: [],
  notes: '',
  heroImage: { ...DEFAULT_HERO_IMAGE },
  settings: {
    studioName: 'Solis Studio',
    currency: 'VND',
    locale: 'vi-VN',
  },
}
