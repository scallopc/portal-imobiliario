import { useMutation } from '@tanstack/react-query'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  sessionId?: string
}

export interface ChatResponse {
  reply: string
}

async function sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
  try {
    // Criar AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `Erro HTTP ${response.status}`
      
      // Mensagens específicas baseadas no status
      if (response.status === 401) {
        throw new Error('Erro de autenticação com o serviço de IA')
      } else if (response.status === 503) {
        throw new Error('Serviço de IA temporariamente indisponível')
      } else if (response.status === 500) {
        throw new Error('Erro interno do servidor de IA')
      } else {
        throw new Error(errorMessage)
      }
    }
    
    return response.json()
  } catch (error) {
    // Se for erro de timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout na requisição. Tente novamente.')
    }
    
    // Se for erro de rede
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
    }
    
    throw error
  }
}

export function useChatMutation() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: sendChatMessage,
  })
}

export function chatMutationKey() {
  return ['chat']
}
