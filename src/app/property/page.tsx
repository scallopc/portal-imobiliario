'use client'

import { useState } from 'react'
import Section from '@/components/common/section'
import PropertyCard from '@/components/PropertyCard'
import PropertyFilters from '@/components/PropertyFilters'
import Pagination from '@/components/common/pagination'
import { useProperties } from '@/hooks/queries/use-properties'
import { SearchFilters } from '@/types'
import { Loader2, Home, AlertCircle } from 'lucide-react'

export default function PropertyPage() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = useProperties(filters, currentPage)

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset para primeira página quando mudar filtros
  }

  const handleClearFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-4">
            Imóveis Disponíveis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre o imóvel perfeito para você. Explore nossa seleção de casas, apartamentos, terrenos e imóveis comerciais.
          </p>
        </div>

        {/* Filtros */}
        <PropertyFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Conteúdo */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
              <p className="text-gray-600">Carregando imóveis...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-gray-600 text-center">
                Erro ao carregar os imóveis. Tente novamente mais tarde.
              </p>
            </div>
          ) : data?.properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Home className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Não encontramos imóveis com os filtros selecionados. Tente ajustar os critérios de busca.
              </p>
            </div>
          ) : (
            <>
              {/* Informações dos resultados */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {data?.pagination?.total || 0} imóveis encontrados
                </p>
                {data?.pagination?.total && data.pagination.total > 0 && (
                  <p className="text-gray-600">
                    Página {data.pagination.page} de {data.pagination.totalPages}
                  </p>
                )}
              </div>

              {/* Grid de propriedades */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {data?.properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Paginação */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <Pagination
                  currentPage={data.pagination.page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  )
}
