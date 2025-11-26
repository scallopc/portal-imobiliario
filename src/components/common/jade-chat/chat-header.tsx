"use client"

import { Bot, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  onClose?: () => void
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gold/30 via-darkBrown/50 to-brown/40 p-3 sm:p-4 border-b border-gold/30 backdrop-blur-sm shrink-0">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-gold to-color-accent rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-darkBg" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent">
              JADE
            </h3>
            <p className="text-[10px] sm:text-xs text-primary-clean/70">Concierge Imobiliária IA</p>
          </div>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-gold/20 text-primary-clean/70 hover:text-primary-clean transition-all duration-300"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
