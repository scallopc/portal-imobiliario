import { useQuery } from "@tanstack/react-query"

export const releaseQueryKey = (id: string) =>
  ["releases", "detail", id] as const

async function fetchRelease(id: string) {
  const res = await fetch(`/api/releases/${id}`, {
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

export function useRelease(id: string) {
  return useQuery({
    queryKey: releaseQueryKey(id),
    queryFn: () => fetchRelease(id),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id, // Só executa se tiver um ID
  })
}
