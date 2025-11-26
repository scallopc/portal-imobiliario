'use client'

import { useState } from 'react'
import { format, isWeekend, isBefore, setHours, setMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { CalendarIcon, Clock } from 'lucide-react'

interface ScheduleVisitProps {
  propertyId?: string
  propertyTitle?: string
  onSchedule: (date: Date) => void
  onCancel?: () => void
  disabled?: boolean
}

export function ScheduleVisit({ propertyId, propertyTitle, onSchedule, onCancel, disabled }: ScheduleVisitProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>('10:00')
  const [showCalendar, setShowCalendar] = useState(false)

  // Gerar horários disponíveis (9h às 18h, de hora em hora)
  const availableTimes = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  // Filtrar datas disponíveis (apenas dias úteis e futuros, incluindo hoje)
  const isDateDisabled = (day: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return isWeekend(day) || isBefore(day, today)
  }

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  // Atualiza a data selecionada sempre que date ou time mudar
  const handleDateTimeChange = () => {
    if (!date) return
    
    const [hours, minutes] = time.split(':').map(Number)
    const startDate = setMinutes(setHours(date, hours), minutes)
    onSchedule(startDate)
  }

  // Chama handleDateTimeChange quando date ou time mudar
  useState(() => {
    if (date) {
      handleDateTimeChange()
    }
  })

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCalendar(!showCalendar)}
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal h-11",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? formatDate(date) : <span>Selecione uma data</span>}
            </Button>
            
            {showCalendar && (
              <div className="absolute z-50 mt-1 bg-background rounded-md border shadow-lg">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                    setShowCalendar(false);
                    if (selectedDate) {
                      const [hours, minutes] = time.split(':').map(Number)
                      const startDate = setMinutes(setHours(selectedDate, hours), minutes)
                      onSchedule(startDate)
                    }
                  }}
                  disabled={isDateDisabled}
                  initialFocus
                  locale={ptBR}
                  className="rounded-md border-0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <select
              value={time}
              onChange={(e) => {
                setTime(e.target.value)
                if (date) {
                  const [hours, minutes] = e.target.value.split(':').map(Number)
                  const startDate = setMinutes(setHours(date, hours), minutes)
                  onSchedule(startDate)
                }
              }}
              disabled={disabled}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-10"
            >
              {availableTimes.map((t) => (
                <option key={t} value={t}>
                  {t}h
                </option>
              ))}
            </select>
            <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <h4 className="mb-2 text-sm font-medium">Detalhes da Visita</h4>
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDate(date) : 'Selecione uma data'}
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            {time}h
          </div>
        </div>
      </div>
    </div>
  )
}
