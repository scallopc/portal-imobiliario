"use client"

import { ChatUiMessage } from "./types"
import { MessageBubble } from "./message-bubble"

interface MessagesListProps {
  messages: ChatUiMessage[]
  onScheduleVisit?: (propertyId: string, propertyTitle: string) => void
}

export function MessagesList({ messages, onScheduleVisit }: MessagesListProps) {
  return (
    <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 chat-scroll min-h-0">
      {messages.map((m) => (
        <MessageBubble 
          key={m.id} 
          message={m} 
          onScheduleVisit={onScheduleVisit}
        />
      ))}
    </div>
  )
}
