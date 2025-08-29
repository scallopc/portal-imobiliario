"use client"

import { ChatUiMessage } from "./types"
import { MessageBubble } from "./message-bubble"

interface MessagesListProps {
  messages: ChatUiMessage[]
}

export function MessagesList({ messages }: MessagesListProps) {
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 chat-scroll">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  )
}
