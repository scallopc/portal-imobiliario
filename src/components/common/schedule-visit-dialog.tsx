'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScheduleVisit } from '@/components/common/jade-chat/schedule-visit';

interface ScheduleVisitDialogProps {
  propertyId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function ScheduleVisitDialog({
  propertyId,
  propertyTitle,
  trigger,
  triggerClassName,
}: ScheduleVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    if (!selectedDate) {
      toast.error('Por favor, selecione uma data e horário');
      return;
    }

    try {
      setIsScheduling(true);

      const response = await fetch('/api/schedule-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          date: selectedDate.toISOString().split('T')[0],
          time: new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
            .format(selectedDate)
            .replace('24:', '00:'),
          propertyTitle,
          propertyId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao agendar visita');
      }

      const formattedDate = format(
        selectedDate,
        "EEEE, d 'de' MMMM 'de' yyyy 'às' HH:mm",
        { locale: ptBR }
      );

      if (data.calendarWarning || data.calendarError) {
        console.warn('⚠️ Aviso do calendário:', data.calendarWarning);
        console.warn('⚠️ Erro:', data.calendarError);
        console.warn('⚠️ Debug:', data.debug);

        toast.warning('Visita agendada com ressalvas', {
          description: data.calendarWarning || 'Calendário não sincronizado.',
          duration: 8000,
        });
      } else {
        toast.success('Visita agendada com sucesso!', {
          description: `Sua visita está agendada para ${formattedDate}.`,
          action: data.eventId
            ? {
              label: 'Abrir Google Calendar',
              onClick: () => {
                window.open(
                  `https://calendar.google.com/calendar/event?eid=${data.eventId}`,
                  '_blank'
                );
              },
            }
            : undefined,
        });
      }

      form.reset();
      setSelectedDate(null);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao agendar visita:', error);
      toast.error('Erro ao agendar visita', {
        description:
          error instanceof Error ? error.message : 'Tente novamente mais tarde.',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className={
              triggerClassName ||
              'w-full border-dashed border-accent/50 text-accent hover:bg-accent hover:border-accent flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-[1.02]'
            }
          >
            <Calendar className="w-4 h-4" />
            Agendar Visita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Visita</DialogTitle>
          <DialogDescription>
            Preencha seus dados para agendar uma visita ao imóvel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome completo <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Telefone <span className="text-destructive">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Data e horário <span className="text-destructive">*</span>
            </label>
            <ScheduleVisit
              propertyId={propertyId}
              propertyTitle={propertyTitle}
              onSchedule={(date) => setSelectedDate(date)}
              disabled={isScheduling}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isScheduling}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedDate || isScheduling}>
              {isScheduling ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
