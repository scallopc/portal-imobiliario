"use client"

import { Button } from "@/components/ui/button"
import { Bot, X } from "lucide-react"

interface FloatingButtonProps {
  isOpen: boolean
  onToggle: () => void
}

export function FloatingButton({ isOpen, onToggle }: FloatingButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onToggle}
        data-jade-chat-button
        className="w-16 h-16 rounded-full bg-gradient-to-r from-gold via-color-accent to-secondary hover:from-color-accent hover:to-gold text-darkBg shadow-2xl hover:shadow-gold/30 transform hover:scale-110 transition-all duration-500 border-2 border-gold/50 hover:border-gold animate-pulse hover:animate-none"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
    </div>
  )
}
