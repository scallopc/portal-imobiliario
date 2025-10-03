'use client';

import { useState } from 'react';
import Section from '@/components/common/section';
import { ReleaseCard } from '@/components/releases/release-card';
import { SearchFilters, ReleaseFilters as ReleaseFiltersType } from '@/components/common/search-filters';
import { Button } from '@/components/ui/button';
import { MessageCircle, TrendingUp, Building, Clock, CheckCircle, Loader2, AlertCircle, Home } from 'lucide-react';
import { useReleases } from '@/hooks/queries/use-releases';
import { Release, Unit } from '@/types/releases';
import Pagination from '@/components/common/pagination';
import Head from 'next/head';



export default function ReleasesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ReleaseFiltersType>({
    neighborhood: '',
    status: '',
    priceRange: { min: 0, max: 100000000 },
    bedrooms: [],
    bathrooms: [],
    area: { min: 0, max: 10000 },
    parking: [],
    deliveryDate: { min: '', max: '' }
  });

  const { data: releasesData, isLoading, error } = useReleases({
  });

  const handleOpenChat = () => {
    const floatingButton = document.querySelector('[data-jade-chat-button]') as HTMLButtonElement;
    if (floatingButton) {
      floatingButton.click();
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'na_planta':
        return { icon: Building, label: 'Na Planta', color: 'text-blue-500' };
      case 'em_construcao':
        return { icon: Clock, label: 'Em Construção', color: 'text-orange-500' };
      case 'recem_entregue':
        return { icon: CheckCircle, label: 'Recém Entregue', color: 'text-green-500' };
      default:
        return { icon: Building, label: 'Lançamento', color: 'text-accent' };
    }
  };

  const releases = releasesData?.releases || [];


  const filteredReleases = releases.filter((release: Release) => {
    if (filters.neighborhood && release.address?.neighborhood !== filters.neighborhood) return false;
    if (filters.status && release.status !== filters.status) return false;

    // Filtrar por preço baseado nas unidades
    if (release.units && release.units.length > 0) {
      const prices = release.units.map((unit: Unit) => unit.price || 0).filter((price: number) => price > 0);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice > filters.priceRange.max || maxPrice < filters.priceRange.min) return false;
      }
    }

    if (filters.bedrooms.length > 0 && release.units) {
      const unitBedrooms = release.units.map((unit: Unit) => unit.bedrooms || 0);
      if (!filters.bedrooms.some(bed => unitBedrooms.includes(bed))) return false;
    }

    return true;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Head>
        <title>Lançamentos Exclusivos Zona Sul RJ | Empreendimentos Novos | Portal Imobiliário</title>
        <meta name="description" content="Descubra os mais novos lançamentos na Zona Sul do Rio de Janeiro. Empreendimentos na planta, em construção e recém-entregues com condições especiais." />
        <meta name="keywords" content="lançamentos zona sul, empreendimentos novos rio de janeiro, apartamentos na planta, imóveis em construção, zona sul rj" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content="Lançamentos Exclusivos Zona Sul RJ | Empreendimentos Novos" />
        <meta property="og:description" content="Descubra os mais novos lançamentos na Zona Sul do Rio de Janeiro. Empreendimentos na planta, em construção e recém-entregues com condições especiais." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zonasullancamentos.com.br/lancamentos" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://zonasullancamentos.com.br/lancamentos" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Portal Imobiliário",
              "description": "Especialistas em lançamentos na Zona Sul do Rio de Janeiro",
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
              "serviceType": "Real Estate Development"
            })
          }}
        />
      </Head>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <Section className="relative pt-32 pb-20">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
            }}
          ></div>

          {/* Dark Overlays */}
          <div className="absolute inset-0 bg-darkBg/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-darkBg/60 via-transparent to-darkBg/40"></div>

          {/* Blur Effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative container mx-auto px-4 text-center">
            <h1 className="font-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent">
                Lançamentos Exclusivos
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-clean mb-8 max-w-4xl mx-auto leading-relaxed">
              Descubra os mais novos empreendimentos da Zona Sul. Imóveis na planta, em construção ou recém-entregues com condições especiais.
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

        {/* Filters and Results */}
        <Section className="py-16 bg-gradient-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              config={{
                showStatus: true,
                statusOptions: [
                  { value: 'na_planta', label: 'Na Planta', icon: Building },
                  { value: 'em_construcao', label: 'Em Construção', icon: Clock },
                  { value: 'recem_entregue', label: 'Recém Entregue', icon: CheckCircle }
                ],
              }}
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
              ) : filteredReleases.length === 0 ? (
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
                    <p>
                      {filteredReleases.length || 0} imóveis encontrados
                    </p>
                    {releasesData?.pagination?.total && releasesData.pagination.total > 0 && (
                      <p>
                        Página {releasesData.pagination.page} de {releasesData.pagination.totalPages}
                      </p>
                    )}
                  </div>

                  {/* Grid de propriedades */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredReleases.map((release) => (
                      <ReleaseCard key={release.id} release={release} />
                    ))}
                  </div>

                  {/* Paginação */}
                  {releasesData?.pagination && releasesData.pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={releasesData.pagination.page}
                      totalPages={releasesData.pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
