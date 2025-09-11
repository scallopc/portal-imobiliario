"use client"

import { Bot } from "lucide-react"

export function ChatHeader() {
  return (
    <div className="bg-gradient-to-r from-gold/30 via-darkBrown/50 to-brown/40 p-4 border-b border-gold/30 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-gold to-color-accent rounded-full flex items-center justify-center">
          <Bot className="h-5 w-5 text-darkBg" />
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent">
            JADE
          </h3>
          <p className="text-xs text-primary-clean/70">Concierge Imobiliária IA</p>
        </div>
      </div>
    </div>
  )
}
