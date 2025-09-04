import { useQuery, queryOptions } from "@tanstack/react-query"
import type { LinkDTO } from "@/actions/get-link/schema"

export const linkQueryKey = (id: string) => ["links", "get", id] as const

async function fetchLink(id: string): Promise<LinkDTO> {
  const res = await fetch(`/api/links/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Falha ao carregar link")
  return res.json()
}

export function useLink(id?: string) {
  return useQuery(
    queryOptions({
      queryKey: id ? linkQueryKey(id) : ["links", "get", ""] as const,
      queryFn: () => fetchLink(id as string),
      enabled: Boolean(id),
      staleTime: 30_000,
    })
  )
}


