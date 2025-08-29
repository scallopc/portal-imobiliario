import { useQuery } from "@tanstack/react-query"
import type { LeadDTO } from "@/actions/get-lead/schema"

export const leadQueryKey = (id: string) => ["leads", id] as const

async function fetchLead(id: string): Promise<LeadDTO> {
  const res = await fetch(`/api/leads/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Falha ao carregar lead")
  return res.json()
}

export function useLead(id: string) {
  return useQuery<LeadDTO, Error>({
    queryKey: leadQueryKey(id),
    queryFn: () => fetchLead(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}


