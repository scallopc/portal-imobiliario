'use client';

import React from 'react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const featuredProperties = [
  {
    id: '1',
    title: 'Apartamento Vista Mar em Ipanema',
    price: 1850000,
    neighborhood: 'Ipanema',
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    parking: 1,
    image: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
    description: 'Luxuoso apartamento com vista deslumbrante para o mar de Ipanema. Totalmente reformado com acabamentos de primeira qualidade.',
    features: ['Vista para o mar', 'Reformado', 'Portaria 24h', 'Próximo ao metrô']
  },
  {
    id: '2',
    title: 'Cobertura Duplex no Leblon',
    price: 3200000,
    neighborhood: 'Leblon',
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    parking: 2,
    image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    description: 'Espetacular cobertura duplex com terraço gourmet e vista panorâmica da Lagoa e Cristo Redentor.',
    features: ['Cobertura duplex', 'Terraço gourmet', 'Vista panorâmica', '2 vagas']
  },
  {
    id: '3',
    title: 'Apartamento Charmoso em Botafogo',
    price: 890000,
    neighborhood: 'Botafogo',
    bedrooms: 2,
    bathrooms: 1,
    area: 85,
    parking: 0,
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    description: 'Apartamento aconchegante em prédio clássico de Botafogo. Ideal para quem busca charme e boa localização.',
    features: ['Prédio histórico', 'Alto padrão', 'Próximo shopping', 'Estação de metrô']
  },
  {
    id: '4',
    title: 'Loft Moderno em Copacabana',
    price: 750000,
    neighborhood: 'Copacabana',
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    parking: 0,
    image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
    description: 'Loft contemporâneo completamente reformado, perfeito para jovens profissionais ou investimento.',
    features: ['Design moderno', 'Mobiliado', 'Praia próxima', 'Transporte público']
  },
  {
    id: '5',
    title: 'Casa de Vila no Flamengo',
    price: 1100000,
    neighborhood: 'Flamengo',
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    parking: 1,
    image: 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
    description: 'Charmosa casa de vila reformada mantendo características originais. Quintal privativo e muito charme.',
    features: ['Casa de vila', 'Quintal privativo', 'Reformada', 'Charme histórico']
  },
  {
    id: '6',
    title: 'Apartamento de Luxo na Urca',
    price: 1450000,
    neighborhood: 'Urca',
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    parking: 1,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    description: 'Imóvel exclusivo com vista para a Baía de Guanabara e Pão de Açúcar. Localização privilegiada e muito verde.',
    features: ['Vista para baía', 'Área verde', 'Exclusividade', 'Pão de Açúcar']
  }
];

export default function FeaturedProperties() {


  const handleRedirectToProperties = () => {
    // Redirecionar para a página de imóveis
    window.location.href = '/imoveis'
  }


  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Imóveis em Destaque
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Seleção especial dos melhores imóveis disponíveis na Zona Sul.
            Nossa IA pode ajudar você a encontrar opções similares ou totalmente personalizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="text-center mt-16">

          <Button
            onClick={handleRedirectToProperties}
            variant="outline"
            size="lg"
            className="group relative border-2 border-accent/40 text-foreground hover:bg-accent/10 hover:border-accent hover:text-accent px-10 py-5 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/15 rounded-xl backdrop-blur-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10"> Ver Mais Imóveis </span>
          </Button>

        </div>
      </div>
    </section>
  );
}