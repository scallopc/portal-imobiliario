"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Bot, AlertCircle, RefreshCw } from "lucide-react"

interface ChatFallbackProps {
  error?: string
  onRetry?: () => void
}

export function ChatFallback({ error, onRetry }: ChatFallbackProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[400px] bg-[#1a1510]/35 rounded-3xl shadow-2xl border-2 border-gold/30 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
      <div className="bg-gradient-to-r from-gold via-color-accent to-secondary p-4 text-darkBg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">JADE - Assistente Imobiliária</h3>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-12 w-12 text-gold/70 mb-4" />
        
        <h4 className="text-lg font-semibold text-white mb-2">
          Chat Temporariamente Indisponível
        </h4>
        
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {error || "Nosso assistente virtual está passando por manutenção. Tente novamente em alguns minutos."}
        </p>
        
        <div className="space-y-3 w-full">
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-gold hover:bg-gold/90 text-darkBg font-medium"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Tentando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </>
              )}
            </Button>
          )}
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>💬 Entre em contato conosco:</p>
            <p>📱 WhatsApp: (21) 99999-9999</p>
            <p>📧 Email: contato@portal.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
