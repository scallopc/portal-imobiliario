'use client'

import { useState } from 'react'
import Section from '@/components/common/section'
import { PropertyCard } from '@/components/properties/property-card'
import { SearchFilters } from '@/components/common/search-filters'
import Pagination from '@/components/common/pagination'
import { useProperties } from '@/hooks/queries/use-properties'
import { PropertyFilters as PropertyFiltersType } from '@/types/filters'
import { FilterConfig } from '@/components/common/search-filters'
import { SearchFilters as SearchFiltersType } from '@/types'
import { Loader2, Home, AlertCircle, Search, MessageCircle, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Head from 'next/head'

export default function PropertyPage() {
  const [filters, setFilters] = useState<PropertyFiltersType>({
    neighborhood: '',
    priceRange: { min: 0, max: 100000000 },
    bedrooms: [],
    propertyType: '',
    bathrooms: [],
    area: { min: 0, max: 10000 },
    parking: []
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filterConfig: FilterConfig = {
    showPropertyType: true,
    propertyTypes: [
      { value: 'apartamento', label: 'Apartamento', icon: Building },
      { value: 'casa', label: 'Casa', icon: Home },
      { value: 'cobertura', label: 'Cobertura', icon: Building },
      { value: 'studio', label: 'Studio', icon: Building }
    ],
    maxPrice: 100000000,
    maxArea: 10000
  }

  // Converter PropertyFilters para SearchFilters
  const searchFilters: SearchFiltersType = {
    neighborhood: filters.neighborhood,
    type: filters.propertyType,
    minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
    maxPrice: filters.priceRange.max < 100000000 ? filters.priceRange.max : undefined,
    bedrooms: filters.bedrooms.length > 0 ? Math.min(...filters.bedrooms) : undefined,
    bathrooms: filters.bathrooms.length > 0 ? Math.min(...filters.bathrooms) : undefined,
    minArea: filters.area.min > 0 ? filters.area.min : undefined,
    maxArea: filters.area.max < 10000 ? filters.area.max : undefined
  }

  const { data, isLoading, error } = useProperties(searchFilters, currentPage)
  console.log('data', data)
  const handleFiltersChange = (newFilters: PropertyFiltersType) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleOpenChat = () => {
    const floatingButton = document.querySelector('[data-jade-chat-button]') as HTMLButtonElement
    if (floatingButton) {
      floatingButton.click()
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Head>
        <title>Imóveis à Venda na Zona Sul RJ | Apartamentos e Casas | Portal Imobiliário</title>
        <meta name="description" content="Encontre os melhores imóveis à venda na Zona Sul do Rio de Janeiro. Apartamentos, casas e imóveis comerciais em Ipanema, Copacabana, Leblon com as melhores condições." />
        <meta name="keywords" content="imóveis venda zona sul, apartamentos ipanema, casas copacabana, leblon, botafogo, flamengo, imóveis rio de janeiro" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content="Imóveis à Venda na Zona Sul RJ | Apartamentos e Casas" />
        <meta property="og:description" content="Encontre os melhores imóveis à venda na Zona Sul do Rio de Janeiro. Apartamentos, casas e imóveis comerciais com as melhores condições." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zonasullancamentos.com.br/imoveis" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://zonasullancamentos.com.br/imoveis" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Portal Imobiliário",
              "description": "Especialistas em imóveis na Zona Sul do Rio de Janeiro",
              "url": "https://zonasullancamentos.com.br",
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Rio de Janeiro",
                  "containedInPlace": {
                    "@type": "State",
                    "name": "Rio de Janeiro"
                  }
                }
              ],
              "serviceType": "Real Estate Sales"
            })
          }}
        />
      </Head>

      {/* Hero Section */}
      <Section className="relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        ></div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-darkB"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-darkRed/50 to-black/70"></div>
        {/* Blur Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-darkBrown/40 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent">Imóveis Disponíveis</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-clean mb-8 max-w-4xl mx-auto leading-relaxed">
            Encontre o imóvel perfeito para você. Explore nossa seleção de casas, apartamentos e imóveis comerciais nas melhores localizações.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleOpenChat}
              className="group relative bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/90 hover:via-accent hover:to-accent text-accent-foreground px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/25 rounded-xl border border-accent/30 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
              <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">Fale com nossa concierge Jade IA</span>
            </Button>

          </div>
        </div>
      </Section>

      {/* Content Section */}
      <Section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtros */}
          <div id="filters-section">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              config={filterConfig}
            />
          </div>

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
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Home className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center max-w-md">
                  Não encontramos imóveis com os filtros selecionados. Tente ajustar os critérios de busca ou fale com Jade IA para encontrar opções personalizadas.
                </p>
                <Button
                  onClick={handleOpenChat}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Buscar com IA
                </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
    </>
  )
}
