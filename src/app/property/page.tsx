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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [activeTab, setActiveTab] = useState('venda')

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

  // Carregar todos os dados sem filtros para fazer filtragem local
  const { data, isLoading, error } = useProperties({}, 1)
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

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1) // Reset para primeira página ao trocar de aba
  }

  // Aplicar todos os filtros localmente
  const applyLocalFilters = (properties: any[]) => {
    console.log('🔍 Aplicando filtros:', filters)
    console.log('📊 Total de propriedades antes do filtro:', properties?.length)
    
    return properties?.filter(property => {
      // Filtro por bairro
      if (filters.neighborhood && filters.neighborhood !== 'all') {
        const propertyNeighborhood = property.address?.neighborhood?.toLowerCase().trim()
        const filterNeighborhood = filters.neighborhood.toLowerCase().trim()
        if (propertyNeighborhood !== filterNeighborhood) return false
      }

      // Filtro por tipo de propriedade
      if (filters.propertyType && filters.propertyType !== 'all') {
        // Tentar diferentes campos possíveis para o tipo
        const propertyType = (
          property.type || 
          property.propertyType || 
          property.category || 
          property.typeProperty ||
          property.building_type
        )?.toLowerCase().trim()
        
        const filterType = filters.propertyType.toLowerCase().trim()
        
        // Debug específico para tipo
        if (property.id === properties?.[0]?.id) {
          console.log('🏠 Debug tipo:', {
            originalPropertyType: property.type,
            propertyObject: property,
            availableFields: Object.keys(property),
            processedPropertyType: propertyType,
            filterType: filterType,
            match: propertyType === filterType
          })
        }
        
        if (propertyType !== filterType) return false
      }

      // Filtro por preço
      if (property.price) {
        // Converter string de preço para número
        let price = 0
        if (typeof property.price === 'string') {
          // Remove tudo exceto números, vírgulas e pontos
          const cleanPrice = property.price.replace(/[^\d,.]/g, '')
          // Se tem vírgula como separador decimal (ex: "1.500,00")
          if (cleanPrice.includes(',') && cleanPrice.lastIndexOf(',') > cleanPrice.lastIndexOf('.')) {
            price = parseFloat(cleanPrice.replace(/\./g, '').replace(',', '.'))
          } else {
            // Se usa ponto como separador decimal (ex: "1500.00")
            price = parseFloat(cleanPrice.replace(/,/g, ''))
          }
        } else {
          price = property.price
        }
        
        // Debug do preço na primeira propriedade
        if (property.id === data?.properties?.[0]?.id) {
          console.log('💰 Debug preço:', {
            originalPrice: property.price,
            processedPrice: price,
            priceRange: filters.priceRange
          })
        }
        
        if (filters.priceRange.min > 0 && price < filters.priceRange.min) return false
        if (filters.priceRange.max < 100000000 && price > filters.priceRange.max) return false
      }

      // Filtro por quartos
      if (filters.bedrooms.length > 0) {
        const minBedrooms = Math.min(...filters.bedrooms)
        if (!property.bedrooms || property.bedrooms < minBedrooms) return false
      }

      // Filtro por banheiros
      if (filters.bathrooms.length > 0) {
        const minBathrooms = Math.min(...filters.bathrooms)
        if (!property.bathrooms || property.bathrooms < minBathrooms) return false
      }

      // Filtro por área
      if (property.totalArea) {
        if (filters.area.min > 0 && property.totalArea < filters.area.min) return false
        if (filters.area.max < 10000 && property.totalArea > filters.area.max) return false
      }

      // Filtro por vagas
      if (filters.parking.length > 0) {
        const minParking = Math.min(...filters.parking)
        if (minParking === 0) {
          // Se selecionou "sem vaga", aceita propriedades sem vaga ou com 0 vagas
          if (property.parkingSpaces && property.parkingSpaces > 0) return false
        } else {
          if (!property.parkingSpaces || property.parkingSpaces < minParking) return false
        }
      }

      return true
    }) || []
  }

  // Aplicar filtros e depois separar por status
  const filteredProperties = applyLocalFilters(data?.properties || [])
  console.log('✅ Propriedades após filtro:', filteredProperties?.length)
  
  const filterPropertiesByStatus = (properties: any[], status: string) => {
    return properties?.filter(property => {
      const propertyStatus = property.status?.toLowerCase()
      return status === 'venda'
        ? (propertyStatus === 'venda' || propertyStatus === 'available')
        : (propertyStatus === 'aluguel' || propertyStatus === 'rented')
    }) || []
  }

  // Separar propriedades filtradas por status
  const propertiesForSale = filterPropertiesByStatus(filteredProperties, 'venda')
  const propertiesForRent = filterPropertiesByStatus(filteredProperties, 'aluguel')

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

          {/* Conteúdo separado por tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-card/80 backdrop-blur-sm p-1 text-muted-foreground shadow-lg border border-accent/20">
                <TabsTrigger
                  value="venda"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md hover:bg-accent/10"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Venda
                </TabsTrigger>
                <TabsTrigger
                  value="aluguel"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md hover:bg-accent/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Aluguel
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="venda" className="min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
                  <p className="text-gray-600">Carregando imóveis para venda...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <p className="text-gray-600 text-center">
                    Erro ao carregar os imóveis. Tente novamente mais tarde.
                  </p>
                </div>
              ) : propertiesForSale.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Home className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center max-w-md">
                    Não encontramos imóveis para venda com os filtros selecionados. Tente ajustar os critérios de busca ou fale com Jade IA.
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
                      {propertiesForSale.length} imóveis para venda encontrados
                    </p>
                  </div>

                  {/* Grid de propriedades para venda */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {propertiesForSale.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="aluguel" className="min-h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
                  <p className="text-gray-600">Carregando imóveis para aluguel...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                  <p className="text-gray-600 text-center">
                    Erro ao carregar os imóveis. Tente novamente mais tarde.
                  </p>
                </div>
              ) : propertiesForRent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Home className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center max-w-md">
                    Não encontramos imóveis para aluguel com os filtros selecionados. Tente ajustar os critérios de busca ou fale com Jade IA.
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
                      {propertiesForRent.length} imóveis para aluguel encontrados
                    </p>
                  </div>

                  {/* Grid de propriedades para aluguel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {propertiesForRent.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </>
  )
}
