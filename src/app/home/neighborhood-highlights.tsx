'use client';

import React from 'react';
import { MapPin, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeighborhoodCardSkeleton } from '@/components/skeleton';

const neighborhoods = [
  {
    name: 'Copacabana',
    description: 'O coração vibrante da Zona Sul com a praia mais famosa do mundo.',
    image: 'https://images.pexels.com/photos/2566056/pexels-photo-2566056.jpeg',
    avgPrice: 'R$ 850.000',
    properties: 450,
    highlights: ['Praia de Copacabana', 'Estação de Metrô', 'Vida noturna']
  },
  {
    name: 'Ipanema',
    description: 'Sofisticação e estilo de vida cosmopolita na beira da praia.',
    image: 'https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg',
    avgPrice: 'R$ 1.200.000',
    properties: 320,
    highlights: ['Praia de Ipanema', 'Rua Garcia D\'Ávila', 'Lagoa Rodrigo de Freitas']
  },
  {
    name: 'Leblon',
    description: 'O bairro mais nobre da Zona Sul, sinônimo de exclusividade.',
    image: 'https://images.pexels.com/photos/2416653/pexels-photo-2416653.jpeg',
    avgPrice: 'R$ 1.800.000',
    properties: 180,
    highlights: ['Praia do Leblon', 'Dias Ferreira', 'Shopping Leblon']
  },
  {
    name: 'Botafogo',
    description: 'Tradição e modernidade em um dos bairros mais charmosos.',
    image: 'https://images.pexels.com/photos/1438834/pexels-photo-1438834.jpeg',
    avgPrice: 'R$ 720.000',
    properties: 380,
    highlights: ['Praia Vermelha', 'Pão de Açúcar', 'Estação de Metrô']
  },
  {
    name: 'Flamengo',
    description: 'Vista para a Baía de Guanabara e proximidade ao centro.',
    image: 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg',
    avgPrice: 'R$ 680.000',
    properties: 420,
    highlights: ['Aterro do Flamengo', 'Museu da República', 'Estação de Metrô']
  },
  {
    name: 'Urca',
    description: 'Tranquilidade e charme histórico no pé do Pão de Açúcar.',
    image: 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg',
    avgPrice: 'R$ 950.000',
    properties: 150,
    highlights: ['Pão de Açúcar', 'Praia Vermelha', 'Mureta da Urca']
  }
];

interface NeighborhoodHighlightsProps {
  isLoading?: boolean;
}

export default function NeighborhoodHighlights({ isLoading }: NeighborhoodHighlightsProps) {

  const handleOpenChat = () => {
    // Encontrar o botão flutuante do JadeChat e clicar nele
    const floatingButton = document.querySelector('[data-jade-chat-button]') as HTMLButtonElement
    if (floatingButton) {
      floatingButton.click()
    }
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Explore os Melhores Bairros
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Cada bairro da Zona Sul tem sua personalidade única. Descubra onde você se encaixa melhor
              e deixe nossa IA te ajudar a encontrar o imóvel perfeito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <NeighborhoodCardSkeleton key={index} />
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="h-12 w-80 bg-muted animate-pulse rounded-xl mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Explore os Melhores Bairros
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Cada bairro da Zona Sul tem sua personalidade única. Descubra onde você se encaixa melhor
            e deixe nossa IA te ajudar a encontrar o imóvel perfeito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {neighborhoods.map((neighborhood) => (
            <div key={neighborhood.name} className="group cursor-pointer">
              <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-accent/20">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-500">
                    <img
                      src={neighborhood.image}
                      alt={neighborhood.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20"></div>
                  </div>
                  {/* <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div> */}

                  {/* Neighborhood Name */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl font-bold text-foreground mb-2 leading-tight">{neighborhood.name}</h3>
                    <p className="text-foreground/90 text-sm leading-relaxed line-clamp-2">
                      {neighborhood.description}
                    </p>
                  </div>
                </div>

                {/* Content Container */}
                <div className="p-6">
                  {/* Average Price */}
                  <div className="mb-6 p-5 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-accent/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-accent/20 rounded-full p-3">
                          <TrendingUp className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Valor Médio</div>
                          <div className="text-2xl font-bold text-accent">{neighborhood.avgPrice}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-card-foreground">{neighborhood.properties}</div>
                        <div className="text-xs text-muted-foreground">imóveis disponíveis</div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-card-foreground uppercase tracking-wide flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>Diferenciais do Bairro</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 overflow-hidden">
                      {neighborhood.highlights.slice(0, 3).map((highlight) => (
                        <span
                          key={highlight}
                          className="bg-accent/10 text-accent px-3 py-2 rounded-full text-sm font-medium border border-accent/20 hover:bg-accent/20 transition-colors whitespace-nowrap"
                        >
                          {highlight}
                        </span>
                      ))}
                      {neighborhood.highlights.length > 3 && (
                        <span className="text-sm text-muted-foreground bg-muted/20 px-3 py-2 rounded-full border border-muted/20 whitespace-nowrap">
                          +{neighborhood.highlights.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            size="lg"
            onClick={handleOpenChat}
            className="group relative bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/90 hover:via-accent hover:to-accent text-accent-foreground px-10 py-5 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/25 rounded-xl border border-accent/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
            <MessageCircle className="w-6 h-6 mr-3 relative z-10" />
            <span className="relative z-10">Pergunte à Jade IA sobre qualquer bairro</span>
          </Button>
        </div>
      </div>
    </section>
  );
}