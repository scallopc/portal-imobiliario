'use client'

import { useState } from 'react'
import { useChatMutation, ChatMessage } from '@/hooks/mutations/use-chat-mutation'
import { FloatingButton } from './floating-button'
import { ChatHeader } from './chat-header'
import { MessagesList } from './messages-list'
import { ChatInput } from './chat-input'
import type { ChatUiMessage } from './types'

export default function JadeChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatUiMessage[]>([
    { id: '1', text: 'Olá! Eu sou a JADE, sua concierge imobiliária inteligente. Como posso ajudá-lo a encontrar o imóvel perfeito hoje?', isUser: false, timestamp: new Date() },
  ])
  const chatMutation = useChatMutation()

  const handleSend = (text: string) => {
    const userMessage: ChatUiMessage = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])

    const chatHistory: ChatMessage[] = [
      ...messages.map((m): ChatMessage => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
      { role: 'user', content: text },
    ]

    chatMutation.mutate(
      { messages: chatHistory },
      {
        onSuccess: (data: { reply: string }) => {
          setMessages(prev => [...prev, { id: Date.now().toString() + '-ai', text: data.reply, isUser: false, timestamp: new Date() }])
        },
        onError: () => {
          setMessages(prev => [...prev, { id: Date.now().toString() + '-err', text: 'Erro ao buscar resposta da IA.', isUser: false, timestamp: new Date() }])
        },
      }
    )
  }

  return (
    <>
      <FloatingButton isOpen={isOpen} onToggle={() => setIsOpen(v => !v)} />
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[calc(100vh-8rem)] max-h-[500px] min-h-[400px] bg-[#1a1510]/35 rounded-3xl shadow-2xl border-2 border-gold/30 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
          <ChatHeader />
          <MessagesList messages={messages} />
          <ChatInput disabled={chatMutation.isPending} onSend={handleSend} />
        </div>
      )}
    </>
  )
}
