import { useQuery, queryOptions } from "@tanstack/react-query"
import type { LinkListItem } from "@/actions/list-links/schema"

export const linksQueryKey = () => ["links", "list"] as const

async function fetchLinks(): Promise<LinkListItem[]> {
  const res = await fetch("/api/links", { cache: "no-store" })
  if (!res.ok) throw new Error("Falha ao carregar links")
  return res.json()
}

export function useLinks() {
  return useQuery(
    queryOptions({
      queryKey: linksQueryKey(),
      queryFn: fetchLinks,
      staleTime: 30_000,
    })
  )
}


