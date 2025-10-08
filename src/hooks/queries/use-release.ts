import { useQuery } from "@tanstack/react-query"

export const releaseQueryKey = (slug: string) =>
  ["releases", "detail", slug] as const

async function fetchRelease(slug: string) {
  const res = await fetch(`/api/releases/${slug}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  })

  if (!res.ok) {
    let errorMessage = `Erro na resposta da API (${res.status})`
    try {
      const errorData = await res.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      const text = await res.text()
      errorMessage = text || errorMessage
    }
    throw new Error(errorMessage)
  }

  const data = await res.json()
  return data
}

export function useRelease(slug: string) {
  return useQuery({
    queryKey: releaseQueryKey(slug),
    queryFn: () => fetchRelease(slug),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!slug, // Só executa se tiver um slug
  })
}
