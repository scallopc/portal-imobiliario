"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Send } from "lucide-react"

const schema = z.object({
  message: z.string().min(1, "Digite uma mensagem"),
})

type FormValues = z.infer<typeof schema>

interface ChatInputProps {
  disabled: boolean
  onSend: (text: string) => void
}

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { message: "" } })

  const submit = (values: FormValues) => {
    onSend(values.message)
    form.reset({ message: "" })
  }

  return (
    <div className="p-4 border-t border-gold/30 bg-darkBg/80 backdrop-blur-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Digite sua mensagem..."
                    className="flex-1 bg-darkBg/90 border-2 border-gold/40 rounded-xl text-primary-clean placeholder-darkBrown focus:ring-4 focus:ring-gold/30 focus:border-gold transition-all duration-500 h-auto"
                    disabled={disabled}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" variant="ghost" disabled={disabled} className="bg-gradient-to-r from-gold/20 to-color-accent/20 hover:from-gold/30 hover:to-color-accent/30 text-primary-clean border-2 border-gold/40 hover:border-gold/60 rounded-xl transition-all duration-300">
            {disabled ? (
              <svg className="animate-spin h-4 w-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a 8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
