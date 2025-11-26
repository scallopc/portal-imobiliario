"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatUiMessage } from "./types"
import { ScheduleVisit } from './schedule-visit'
import { useScheduleVisit } from '@/hooks/mutations/use-schedule-visit'
import { toast } from 'sonner'
interface MessageBubbleProps {
  message: ChatUiMessage
  onScheduleVisit?: (propertyId: string, propertyTitle: string) => void
}

export function MessageBubble({ message, onScheduleVisit }: MessageBubbleProps) {
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const scheduleVisit = useScheduleVisit()

  const container = message.isUser ? "justify-end" : "justify-start"
  const bubble = message.isUser
    ? "bg-gradient-to-r from-gold/40 to-color-accent/40 text-primary-clean border border-gold/50 backdrop-blur-sm"
    : "bg-darkBrown/60 text-primary-clean border border-gold/40 backdrop-blur-sm"

  // Extrair informações do imóvel da mensagem, se disponível
  const propertyId = message.propertyId
  const propertyTitle = message.propertyTitle

  const handleScheduleClick = async () => {
    if (!propertyId) return

    try {
      setIsScheduling(true)

      // Se houver um manipulador externo, use-o
      if (onScheduleVisit) {
        onScheduleVisit(propertyId, propertyTitle || 'Imóvel')
        return
      }

      // Caso contrário, mostre o formulário de agendamento
      setShowScheduleForm(true)
    } catch (error) {
      console.error('Erro ao iniciar agendamento:', error)
      toast.error('Não foi possível iniciar o agendamento. Por favor, tente novamente.')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleScheduleSubmit = async (date: Date) => {
    if (!propertyId) return

    try {
      setIsScheduling(true)

      await scheduleVisit.mutateAsync({
        propertyId,
        propertyTitle,
        visitDate: date,
      })

      toast.success(`Sua visita foi agendada com sucesso para ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`)

      setShowScheduleForm(false)
    } catch (error) {
      console.error('Erro ao agendar visita:', error)
      toast.error("Não foi possível agendar sua visita. Por favor, tente novamente.")
    } finally {
      setIsScheduling(false)
    }
  }

  // Verificar se a mensagem contém informações de um imóvel
  const showScheduleButton = !message.isUser && Boolean(propertyId)

  return (
    <div className={`flex ${container}`}>
      <div className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] p-2.5 sm:p-3 rounded-2xl ${bubble}`}>
        <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>

        {showScheduleButton && (
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] sm:text-xs py-1 px-2 sm:px-3 h-auto"
              onClick={handleScheduleClick}
              disabled={isScheduling}
            >
              {isScheduling ? 'Agendando...' : 'Agendar Visita'}
            </Button>
          </div>
        )}

        {showScheduleForm && propertyId && (
          <div className="mt-3">
            <ScheduleVisit
              propertyId={propertyId}
              propertyTitle={propertyTitle}
              onSchedule={handleScheduleSubmit}
              onCancel={() => setShowScheduleForm(false)}
            />
          </div>
        )}

        <span className="text-[10px] sm:text-xs opacity-60 mt-1 block text-right">
          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
