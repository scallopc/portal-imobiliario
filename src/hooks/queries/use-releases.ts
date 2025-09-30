import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface ReleasesResponse {
  releases: any[]
  units: any[]
  total: number
  success: boolean
  seo?: string
}

interface PaginatedReleasesResponse {
  releases: any[]
  units: any[]
  seo?: string
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const releasesQueryKey = (filters: any = {}) => 
  ["releases", "list", filters] as const

async function fetchReleases(filters: any = {}): Promise<ReleasesResponse> {
  const params = new URLSearchParams()
  
  // Adicionar filtros aos parâmetros (igual ao properties)
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
  
  const res = await fetch(`/api/releases?${params.toString()}`, {
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

export function useReleases(filters: any = {}, page: number = 1, limit: number = 12) {
  const query = useQuery<ReleasesResponse, Error>({
    queryKey: releasesQueryKey(filters),
    queryFn: () => fetchReleases(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // Implementar paginação no frontend
  const paginatedData = useMemo((): PaginatedReleasesResponse | undefined => {
    if (!query.data) return undefined

    const { releases, units, total, seo } = query.data
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReleases = releases.slice(startIndex, endIndex)

    return {
      releases: paginatedReleases,
      units: units, // Manter todas as unidades (não paginar)
      seo: seo, // Incluir propriedade seo
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  }, [query.data, page, limit])

  return {
    ...query,
    data: paginatedData
  }
}