"use client"

import { ChatUiMessage } from "./types"

interface MessageBubbleProps {
  message: ChatUiMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const container = message.isUser ? "justify-end" : "justify-start"
  const bubble = message.isUser
    ? "bg-gradient-to-r from-gold/40 to-color-accent/40 text-primary-clean border border-gold/50 backdrop-blur-sm"
    : "bg-darkBrown/60 text-primary-clean border border-gold/40 backdrop-blur-sm"

  return (
    <div className={`flex ${container}`}>
      <div className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-2xl ${bubble}`}>
        <p className="text-sm">{message.text}</p>
        <span className="text-xs opacity-60 mt-1 block">
          {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  )
}
