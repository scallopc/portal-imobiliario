import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ScheduleVisitParams {
  propertyId?: string;
  propertyTitle?: string;
  visitDate: Date;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
}

export function useScheduleVisit() {
  return useMutation({
    mutationFn: async (params: ScheduleVisitParams) => {
      const response = await fetch("/api/schedule-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Erro ao agendar visita");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Visita agendada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao agendar visita");
    },
  });
}

export function useScheduleVisitKey() {
  return ["schedule-visit"];
}
