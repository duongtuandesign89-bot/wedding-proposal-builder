export interface Couple {
  brideName: string
  groomName: string
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  price: number
}

export interface WeddingEvent {
  id: string
  name: string
  date: string
  startTime: string
  endTime: string
  location: string
  services: ServiceItem[]
}

export interface ProposalSettings {
  currency: 'VND'
  locale: 'vi-VN'
}

export interface Introduction {
  enabled: boolean
  text: string
}

export interface TextListSection {
  enabled: boolean
  items: string[]
}

export interface Contact {
  enabled: boolean
  studioName: string
  phone: string
  secondaryPhone?: string
  email?: string
  website?: string
  social?: string
  address?: string
}

export interface HeroImage {
  src: string
  positionX: number
  positionY: number
  zoom: number
}

export interface Adjustment {
  id: string
  name: string
  amount: number
}

export interface Proposal {
  id: string
  title: string
  couple: Couple
  weddingDate: string
  location: string
  events: WeddingEvent[]
  adjustments: Adjustment[]
  introduction: Introduction
  notes: TextListSection
  terms: TextListSection
  contact: Contact
  settings: ProposalSettings
  heroImage: HeroImage
}
