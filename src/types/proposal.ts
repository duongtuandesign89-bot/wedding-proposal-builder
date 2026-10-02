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
  coverImage: string
}

export interface Proposal {
  id: string
  title: string
  couple: Couple
  weddingDate: string
  location: string
  events: WeddingEvent[]
  notes: string
  settings: ProposalSettings
}
