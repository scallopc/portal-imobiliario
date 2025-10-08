export interface ChatInteraction {
  id?: string
  sessionId: string
  userId?: string
  userMessage: string
  aiResponse: string
  timestamp: Date
  responseTime: number
  userLocation?: {
    city: string
    state: string
    country: string
    latitude: number
    longitude: number
  }
  userAgent?: string
  referrer?: string
  leadGenerated: boolean
  propertiesShown: number
  interactionType: 'question' | 'search' | 'lead_qualification' | 'general'
  sentiment?: 'positive' | 'neutral' | 'negative'
  topics: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatSession {
  id?: string
  sessionId: string
  userId?: string
  startTime: Date
  endTime?: Date
  totalInteractions: number
  totalResponseTime: number
  averageResponseTime: number
  leadGenerated: boolean
  userLocation?: {
    city: string
    state: string
    country: string
    latitude: number
    longitude: number
  }
  userAgent?: string
  referrer?: string
  status: 'active' | 'ended' | 'abandoned'
  createdAt: Date
  updatedAt: Date
}

export interface ChatAnalytics {
  totalSessions: number
  totalInteractions: number
  averageSessionDuration: number
  averageInteractionsPerSession: number
  leadConversionRate: number
  topTopics: Array<{ topic: string; count: number }>
  topLocations: Array<{ location: string; count: number }>
  dailyStats: Array<{
    date: string
    sessions: number
    interactions: number
    leads: number
  }>
  responseTimeStats: {
    average: number
    min: number
    max: number
  }
}

export interface CreateChatInteractionRequest {
  sessionId: string
  userId?: string
  userMessage: string
  aiResponse: string
  responseTime: number
  userLocation?: {
    city: string
    state: string
    country: string
    latitude: number
    longitude: number
  }
  userAgent?: string
  referrer?: string
  leadGenerated: boolean
  propertiesShown: number
  interactionType: 'question' | 'search' | 'lead_qualification' | 'general'
  topics: string[]
}
