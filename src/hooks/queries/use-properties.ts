import { useQuery } from "@tanstack/react-query"
import { SearchFilters } from "@/types"
import { useMemo } from "react"

interface PropertiesResponse {
  properties: any[]
  total: number
}

interface PaginatedPropertiesResponse {
  properties: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const propertiesQueryKey = (filters: SearchFilters) => 
  ["properties", "list", filters] as const

async function fetchProperties(filters: SearchFilters): Promise<PropertiesResponse> {
  const params = new URLSearchParams()
  
  // Adicionar filtros aos parâmetros
  if (filters.query) params.append('query', filters.query)
  if (filters.type) params.append('type', filters.type)
  if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
  if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString())
  if (filters.bathrooms) params.append('bathrooms', filters.bathrooms.toString())
  if (filters.minArea) params.append('minArea', filters.minArea.toString())
  if (filters.maxArea) params.append('maxArea', filters.maxArea.toString())
  if (filters.city) params.append('city', filters.city)
  if (filters.neighborhood) params.append('neighborhood', filters.neighborhood)
  
  const res = await fetch(`/api/properties?${params.toString()}`, {
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

export function useProperties(filters: SearchFilters = {}, page: number = 1, limit: number = 12) {
  const query = useQuery<PropertiesResponse, Error>({
    queryKey: propertiesQueryKey(filters),
    queryFn: () => fetchProperties(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })

  // Implementar paginação no frontend
  const paginatedData = useMemo((): PaginatedPropertiesResponse | undefined => {
    if (!query.data) return undefined

    const { properties, total } = query.data
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProperties = properties.slice(startIndex, endIndex)

    return {
      properties: paginatedProperties,
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
