import { z } from 'zod'

export const createChatInteractionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID é obrigatório'),
  userId: z.string().optional(),
  userMessage: z.string().min(1, 'Mensagem do usuário é obrigatória'),
  aiResponse: z.string().min(1, 'Resposta da IA é obrigatória'),
  responseTime: z.number().min(0, 'Tempo de resposta deve ser positivo'),
  userLocation: z.object({
    city: z.string(),
    state: z.string(),
    country: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  leadGenerated: z.boolean().default(false),
  propertiesShown: z.number().min(0).default(0),
  interactionType: z.enum(['question', 'search', 'lead_qualification', 'general']).default('general'),
  topics: z.array(z.string()).default([]),
})

export type CreateChatInteractionInput = z.infer<typeof createChatInteractionSchema>
