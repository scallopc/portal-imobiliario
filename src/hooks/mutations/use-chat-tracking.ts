import { useMutation } from '@tanstack/react-query'
import { createChatInteraction } from '@/actions/create-chat-interaction'
import type { CreateChatInteractionInput } from '@/actions/create-chat-interaction/schema'

export function useChatTracking() {
  return useMutation({
    mutationFn: createChatInteraction,
    onError: (error) => {
      console.error('Erro ao rastrear interação do chat:', error)
    },
  })
}

export function chatTrackingMutationKey() {
  return ['chat-tracking']
}

// Hook para gerar session ID único
export function useSessionId() {
  const sessionId = typeof window !== 'undefined' 
    ? sessionStorage.getItem('chat-session-id') || generateSessionId()
    : generateSessionId()
  
  if (typeof window !== 'undefined' && !sessionStorage.getItem('chat-session-id')) {
    sessionStorage.setItem('chat-session-id', sessionId)
  }
  
  return sessionId
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Função para extrair tópicos da mensagem
export function extractTopics(message: string): string[] {
  const topics: string[] = []
  const messageLower = message.toLowerCase()
  
  // Tipos de imóveis
  if (messageLower.includes('apartamento')) topics.push('apartamento')
  if (messageLower.includes('casa')) topics.push('casa')
  if (messageLower.includes('terreno')) topics.push('terreno')
  if (messageLower.includes('comercial')) topics.push('comercial')
  
  // Ações
  if (messageLower.includes('comprar') || messageLower.includes('compra')) topics.push('compra')
  if (messageLower.includes('alugar') || messageLower.includes('aluguel')) topics.push('aluguel')
  if (messageLower.includes('vender') || messageLower.includes('venda')) topics.push('venda')
  
  // Características
  if (messageLower.includes('preço') || messageLower.includes('valor')) topics.push('preço')
  if (messageLower.includes('quarto')) topics.push('quartos')
  if (messageLower.includes('banheiro')) topics.push('banheiros')
  if (messageLower.includes('área') || messageLower.includes('tamanho')) topics.push('área')
  if (messageLower.includes('localização') || messageLower.includes('bairro')) topics.push('localização')
  
  // Qualificadores
  if (messageLower.includes('barato') || messageLower.includes('econômico')) topics.push('baixo_custo')
  if (messageLower.includes('luxo') || messageLower.includes('premium')) topics.push('luxo')
  if (messageLower.includes('novo') || messageLower.includes('lançamento')) topics.push('novo')
  if (messageLower.includes('usado') || messageLower.includes('seminovo')) topics.push('usado')
  
  return topics.length > 0 ? topics : ['geral']
}

// Função para determinar tipo de interação
export function determineInteractionType(message: string): 'question' | 'search' | 'lead_qualification' | 'general' {
  const messageLower = message.toLowerCase()
  
  // Qualificação de lead
  if (messageLower.includes('nome') || messageLower.includes('telefone') || messageLower.includes('email') || messageLower.includes('contato')) {
    return 'lead_qualification'
  }
  
  // Busca
  const searchTerms = ['quero', 'procuro', 'busco', 'encontrar', 'mostrar', 'ver', 'apartamento', 'casa', 'terreno']
  if (searchTerms.some(term => messageLower.includes(term))) {
    return 'search'
  }
  
  // Pergunta
  const questionWords = ['como', 'quando', 'onde', 'por que', 'qual', 'quanto', '?']
  if (questionWords.some(word => messageLower.includes(word))) {
    return 'question'
  }
  
  return 'general'
}

// Função para contar propriedades mencionadas na resposta
export function countPropertiesInResponse(response: string): number {
  const propertyIndicators = [
    'imóvel', 'propriedade', 'apartamento', 'casa', 'terreno', 'comercial',
    'R$', 'preço', 'valor', 'quarto', 'banheiro', 'área'
  ]
  
  let count = 0
  const responseLower = response.toLowerCase()
  
  // Contar menções diretas de propriedades
  const propertyMentions = (responseLower.match(/imóve(l|is)|propriedade(s)?|apartamento(s)?|casa(s)?/g) || []).length
  
  // Se há indicadores de propriedades, assumir pelo menos 1
  const hasPropertyIndicators = propertyIndicators.some(indicator => 
    responseLower.includes(indicator.toLowerCase())
  )
  
  return Math.max(propertyMentions, hasPropertyIndicators ? 1 : 0)
}

// Função para verificar se um lead foi gerado
export function checkIfLeadGenerated(response: string): boolean {
  const leadIndicators = [
    'nome', 'telefone', 'email', 'contato', 'whatsapp',
    'agendar', 'visita', 'interessado', 'informações'
  ]
  
  const responseLower = response.toLowerCase()
  return leadIndicators.some(indicator => responseLower.includes(indicator))
}

// Função para obter localização do usuário (mock - seria implementada com geolocalização real)
export function getUserLocation() {
  // Por enquanto retorna undefined, mas poderia ser implementada com:
  // - Geolocalização do navegador
  // - IP geolocation
  // - Dados salvos do usuário
  return undefined
}
