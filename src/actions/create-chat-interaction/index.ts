'use server'

import { adminDb } from '@/lib/firebase-admin'
import { createChatInteractionSchema, type CreateChatInteractionInput } from './schema'
import type { ChatInteraction, ChatSession } from '@/types/chat-analytics'

export async function createChatInteraction(input: CreateChatInteractionInput) {
  try {
    const validatedData = createChatInteractionSchema.parse(input)
    
    const now = new Date()
    
    // Analisar sentimento básico da mensagem
    const sentiment = analyzeSentiment(validatedData.userMessage)
    
    // Criar interação
    const interaction: Omit<ChatInteraction, 'id'> = {
      sessionId: validatedData.sessionId,
      userId: validatedData.userId,
      userMessage: validatedData.userMessage,
      aiResponse: validatedData.aiResponse,
      timestamp: now,
      responseTime: validatedData.responseTime,
      userLocation: validatedData.userLocation,
      userAgent: validatedData.userAgent,
      referrer: validatedData.referrer,
      leadGenerated: validatedData.leadGenerated,
      propertiesShown: validatedData.propertiesShown,
      interactionType: validatedData.interactionType,
      sentiment,
      topics: validatedData.topics,
      createdAt: now,
      updatedAt: now,
    }
    
    // Salvar interação
    const interactionRef = await adminDb.collection('chat_interactions').add(interaction)
    
    // Atualizar ou criar sessão
    await updateChatSession(validatedData.sessionId, {
      userId: validatedData.userId,
      userLocation: validatedData.userLocation,
      userAgent: validatedData.userAgent,
      referrer: validatedData.referrer,
      responseTime: validatedData.responseTime,
      leadGenerated: validatedData.leadGenerated,
    })
    
    return { success: true, id: interactionRef.id }
  } catch (error) {
    console.error('Erro ao criar interação do chat:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

async function updateChatSession(
  sessionId: string, 
  data: {
    userId?: string
    userLocation?: any
    userAgent?: string
    referrer?: string
    responseTime: number
    leadGenerated: boolean
  }
) {
  const sessionRef = adminDb.collection('chat_sessions').doc(sessionId)
  const sessionDoc = await sessionRef.get()
  
  const now = new Date()
  
  if (sessionDoc.exists) {
    // Atualizar sessão existente
    const currentData = sessionDoc.data() as ChatSession
    const totalInteractions = currentData.totalInteractions + 1
    const totalResponseTime = currentData.totalResponseTime + data.responseTime
    const averageResponseTime = totalResponseTime / totalInteractions
    
    await sessionRef.update({
      totalInteractions,
      totalResponseTime,
      averageResponseTime,
      leadGenerated: currentData.leadGenerated || data.leadGenerated,
      status: 'active',
      updatedAt: now,
    })
  } else {
    // Criar nova sessão
    const session: Omit<ChatSession, 'id'> = {
      sessionId,
      userId: data.userId,
      startTime: now,
      totalInteractions: 1,
      totalResponseTime: data.responseTime,
      averageResponseTime: data.responseTime,
      leadGenerated: data.leadGenerated,
      userLocation: data.userLocation,
      userAgent: data.userAgent,
      referrer: data.referrer,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
    
    await sessionRef.set(session)
  }
}

function analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['bom', 'ótimo', 'excelente', 'perfeito', 'gostei', 'adorei', 'maravilhoso', 'incrível']
  const negativeWords = ['ruim', 'péssimo', 'horrível', 'não gostei', 'terrível', 'decepcionante']
  
  const messageLower = message.toLowerCase()
  
  const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length
  const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}
