export interface ChatUiMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  propertyId?: string
  propertyTitle?: string
  metadata?: Record<string, any>
}

export interface ScheduledVisit {
  id: string
  propertyId: string
  propertyTitle?: string
  visitDate: Date
  clientName?: string
  clientPhone?: string
  clientEmail?: string
  status: 'scheduled' | 'completed' | 'canceled'
  location?: {
    ip?: string
    city?: string
    region?: string
    country?: string
  }
  createdAt: Date
  updatedAt: Date
}
