'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatMutation, ChatMessage } from '@/hooks/mutations/use-chat-mutation'

interface Message {
    id: string
    text: string
    isUser: boolean
    timestamp: Date
}

export default function JadeChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Eu sou a JADE, sua assistente imobiliária inteligente. Como posso ajudá-lo a encontrar o imóvel perfeito hoje?',
            isUser: false,
            timestamp: new Date()
        }
    ])
    const [inputValue, setInputValue] = useState('')
    const chatMutation = useChatMutation()

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isUser: true,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
        setInputValue('')

        const chatHistory: ChatMessage[] = [
            ...messages.map((msg): ChatMessage => ({
                role: msg.isUser ? 'user' : 'assistant',
                content: msg.text,
            })),
            { role: 'user' as const, content: inputValue },
        ]

        chatMutation.mutate(
            { messages: chatHistory },
            {
                onSuccess: (data: { reply: string }) => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now().toString() + '-ai',
                            text: data.reply,
                            isUser: false,
                            timestamp: new Date(),
                        },
                    ])
                },
                onError: () => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now().toString() + '-err',
                            text: 'Erro ao buscar resposta da IA.',
                            isUser: false,
                            timestamp: new Date(),
                        },
                    ])
                },
            }
        )
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage()
        }
    }

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-gold via-color-accent to-secondary 
          hover:from-color-accent hover:to-gold text-darkBg shadow-2xl hover:shadow-gold/30 
          transform hover:scale-110 transition-all duration-500 border-2 border-gold/50 
          hover:border-gold animate-pulse hover:animate-none"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
                </Button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#1a1510]/35
        rounded-3xl shadow-2xl border-2 border-gold/30 z-50 flex flex-col overflow-hidden backdrop-blur-sm">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-gold/30 via-darkBrown/50 to-brown/40 p-4 
          border-b border-gold/30 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-gold to-color-accent rounded-full 
              flex items-center justify-center">
                                <Bot className="h-5 w-5 text-darkBg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] 
                bg-clip-text text-transparent animate-pulse hover:animate-none">
                                    JADE
                                </h3>
                                <p className="text-xs text-primary-clean/70">Assistente Imobiliária IA</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${message.isUser
                                        ? 'bg-gradient-to-r from-gold/40 to-color-accent/40 text-primary-clean border border-gold/50 backdrop-blur-sm'
                                        : 'bg-darkBrown/60 text-primary-clean border border-gold/40 backdrop-blur-sm'
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <span className="text-xs opacity-60 mt-1 block">
                                        {message.timestamp.toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gold/30 bg-darkBg/80 backdrop-blur-sm">
                        <div className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 bg-darkBg/90 border-2 border-gold/40 rounded-xl 
                text-primary-clean placeholder-darkBrown focus:ring-4 focus:ring-gold/30 
                focus:border-gold transition-all duration-500 h-auto"
                                disabled={chatMutation.isPending}
                            />
                            <Button
                                onClick={handleSendMessage}
                                variant="ghost"
                                className="bg-gradient-to-r from-gold/20 to-color-accent/20 hover:from-gold/30 
                hover:to-color-accent/30 text-primary-clean border-2 border-gold/40 
                hover:border-gold/60 rounded-xl transition-all duration-300"
                                disabled={chatMutation.isPending}
                            >
                                {chatMutation.isPending ? (
                                    <svg className="animate-spin h-4 w-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
