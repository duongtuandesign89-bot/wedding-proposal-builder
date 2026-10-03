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
  studioName: string
  currency: 'VND'
  locale: 'vi-VN'
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
  notes: string
  settings: ProposalSettings
  heroImage: HeroImage
}
