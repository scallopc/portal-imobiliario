'use client'

import { useState, useEffect, useCallback } from 'react'
import { useChatMutation, ChatMessage } from '@/hooks/mutations/use-chat-mutation'
import { useSessionId } from '@/hooks/mutations/use-chat-tracking'
import { FloatingButton } from './floating-button'
import { ChatHeader } from './chat-header'
import { MessagesList } from './messages-list'
import { ChatInput } from './chat-input'
import { ChatFallback } from './chat-fallback'
import type { ChatUiMessage } from './types'

function JadeChat() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatUiMessage[]>([
    { id: '1', text: 'Olá! Eu sou a JADE, sua concierge imobiliária inteligente. Como posso ajudá-lo a encontrar o imóvel perfeito hoje?', isUser: false, timestamp: new Date() },
  ])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const chatMutation = useChatMutation()
  const sessionId = useSessionId()

  // Verificar se o chat está funcionando ao montar o componente
  useEffect(() => {
    const checkChatHealth = async () => {
      try {
        const response = await fetch('/api/chat/health', { method: 'GET' })
        if (!response.ok) {
          throw new Error('Chat API não disponível')
        }
      } catch (error) {
        console.error('Chat health check failed:', error)
        setHasError(true)
        setErrorMessage('Serviço de chat temporariamente indisponível')
      }
    }

    checkChatHealth()
  }, [])

  const handleSend = (text: string) => {
    const userMessage: ChatUiMessage = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])

    const chatHistory: ChatMessage[] = [
      ...messages.map((m): ChatMessage => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
      { role: 'user', content: text },
    ]

    chatMutation.mutate(
      { messages: chatHistory, sessionId },
      {
        onSuccess: (data: { reply: string }) => {
          const aiMessage = { id: Date.now().toString() + '-ai', text: data.reply, isUser: false, timestamp: new Date() }
          setMessages(prev => [...prev, aiMessage])
        },
        onError: (error: Error) => {
          let errorText = 'Erro ao buscar resposta da IA.'

          // Mensagens específicas baseadas no tipo de erro
          if (error.message.includes('autenticação')) {
            errorText = 'Erro de configuração da IA. Tente novamente em alguns minutos.'
          } else if (error.message.includes('conexão')) {
            errorText = 'Erro de conexão. Verifique sua internet e tente novamente.'
          } else if (error.message.includes('indisponível')) {
            errorText = 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.'
          } else if (error.message.includes('servidor')) {
            errorText = 'Erro interno. Nossa equipe foi notificada. Tente novamente.'
          } else if (error.message.includes('Timeout')) {
            errorText = 'A resposta está demorando mais que o esperado. Tente novamente.'
          }

          const errorMessage = { id: Date.now().toString() + '-err', text: errorText, isUser: false, timestamp: new Date() }
          setMessages(prev => [...prev, errorMessage])

          // Se houver muitos erros consecutivos, mostrar fallback
          const recentErrors = messages.filter(m =>
            !m.isUser && m.text.includes('Erro') &&
            Date.now() - m.timestamp.getTime() < 60000 // últimos 60 segundos
          ).length

          if (recentErrors >= 2) {
            setHasError(true)
            setErrorMessage('Múltiplos erros detectados. Serviço pode estar instável.')
          }
        },
      }
    )
  }

  const handleRetry = () => {
    setHasError(false)
    setErrorMessage('')
    // Limpar mensagens de erro
    setMessages(prev => prev.filter(m => !m.text.includes('Erro')))
  }

  const handleScheduleVisit = useCallback((propertyId: string, propertyTitle: string) => {
    // Adiciona uma mensagem de confirmação
    const confirmationMessage: ChatUiMessage = {
      id: `schedule-${Date.now()}`,
      text: `Vou te ajudar a agendar uma visita para o imóvel ${propertyTitle}. Por favor, selecione a data e horário desejados.`,
      isUser: false,
      timestamp: new Date(),
      propertyId,
      propertyTitle,
    }

    setMessages(prev => [...prev, confirmationMessage])
  }, [])

  return (
    <>
      <FloatingButton isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-full sm:max-w-md h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] max-h-[700px] bg-background border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl flex flex-col overflow-hidden z-50">
          <ChatHeader onClose={() => setIsOpen(false)} />
          {hasError ? (
            <ChatFallback />
          ) : (
            <>
              <MessagesList
                messages={messages}
                onScheduleVisit={handleScheduleVisit}
              />
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </>
          )}
        </div>
      )}
    </>
  )
}

export default JadeChat
