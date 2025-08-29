import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateLeadInput } from "@/actions/create-lead/schema"
import { leadsQueryKey } from "@/hooks/queries/use-leads"
import { toast } from "sonner"

async function postLead(input: CreateLeadInput): Promise<{ id: string }> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error("Falha ao criar lead")
  return res.json()
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: postLead,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: leadsQueryKey() })
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao criar lead"),
  })
}


