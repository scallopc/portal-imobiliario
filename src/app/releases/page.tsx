'use client';

import { useState } from 'react';
import Section from '@/components/common/section';
import { ReleaseCard } from '@/components/releases/ReleaseCard';
import { PropertyFilters } from '@/components/common/PropertyFilters';
import { ReleaseFilters as ReleaseFiltersType } from '@/types/filters';
import { Button } from '@/components/ui/button';
import { MessageCircle, TrendingUp, Building, Clock, CheckCircle } from 'lucide-react';

const mockReleases = [
  {
    id: '1',
    name: 'Residencial Vista Mar',
    developer: 'Construtora Premium',
    neighborhood: 'Barra da Tijuca',
    status: 'na_planta',
    deliveryDate: '2026-06-01',
    priceRange: { min: 850000, max: 1200000 },
    units: { total: 120, available: 95 },
    bedrooms: [2, 3, 4],
    areas: { min: 85, max: 140 },
    images: [
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    description: 'Empreendimento de alto padrão com vista para o mar e acabamentos de luxo.',
    features: ['Vista para o mar', 'Piscina infinity', 'Academia', 'Salão de festas', 'Vaga dupla'],
    financing: ['FGTS', 'Financiamento bancário', 'Parcelamento direto'],
    vgv: 120000000
  },
  {
    id: '2',
    name: 'Condomínio Jardim Atlântico',
    developer: 'Incorporadora Moderna',
    neighborhood: 'Recreio dos Bandeirantes',
    status: 'em_construcao',
    deliveryDate: '2025-12-01',
    priceRange: { min: 650000, max: 950000 },
    units: { total: 80, available: 32 },
    bedrooms: [2, 3],
    areas: { min: 70, max: 110 },
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'
    ],
    description: 'Condomínio clube com ampla área de lazer e proximidade à praia.',
    features: ['Quadra poliesportiva', 'Playground', 'Churrasqueira', 'Portaria 24h'],
    financing: ['FGTS', 'Minha Casa Minha Vida'],
    vgv: 76000000
  },
  {
    id: '3',
    name: 'Edifício Golden Tower',
    developer: 'Golden Incorporações',
    neighborhood: 'Icaraí',
    status: 'recem_entregue',
    deliveryDate: '2024-08-01',
    priceRange: { min: 750000, max: 1100000 },
    units: { total: 60, available: 8 },
    bedrooms: [3, 4],
    areas: { min: 95, max: 130 },
    images: [
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'
    ],
    description: 'Torre residencial de luxo com vista panorâmica da Baía de Guanabara.',
    features: ['Vista panorâmica', 'Cobertura duplex', 'Elevador privativo', 'Varanda gourmet'],
    financing: ['Financiamento bancário', 'Parcelamento direto'],
    vgv: 66000000
  }
];


export default function ReleasesPage() {
  const [filters, setFilters] = useState<ReleaseFiltersType>({
    neighborhood: '',
    status: '',
    priceRange: { min: 0, max: 2000000 },
    bedrooms: [],
    deliveryDate: { min: '', max: '' }
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

  const filteredReleases = mockReleases.filter(release => {
    if (filters.neighborhood && release.neighborhood !== filters.neighborhood) return false;
    if (filters.status && release.status !== filters.status) return false;
    if (release.priceRange.min > filters.priceRange.max || release.priceRange.max < filters.priceRange.min) return false;
    if (filters.bedrooms.length > 0 && !filters.bedrooms.some(bed => release.bedrooms.includes(bed))) return false;
    return true;
  });

  return (
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
        <div className="container mx-auto px-4">
          <PropertyFilters
            filters={filters}
            onFiltersChange={setFilters}
            config={{
              showNeighborhood: true,
              showPriceRange: true,
              showBedrooms: true,
              showStatus: true,
              maxPrice: 2000000
            }}
            title="Filtros de Lançamentos"
          />

          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {filteredReleases.length} Lançamentos Encontrados
              </h2>
              <p className="text-muted-foreground">
                Empreendimentos selecionados nas melhores localizações
              </p>
            </div>


          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredReleases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>

          {filteredReleases.length === 0 && (
            <div className="text-center py-16">
              <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum lançamento encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Tente ajustar os filtros ou fale com nossa IA para encontrar opções personalizadas.
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
          )}
        </div>
      </Section>
    </div>
  );
}
