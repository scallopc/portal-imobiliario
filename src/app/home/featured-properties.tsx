'use client';

import React from 'react';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import Head from 'next/head';

const featuredProperties = [
  {
    code: 'IPN001',
    slug: 'apartamento-vista-mar-ipanema',
    title: 'Apartamento Vista Mar em Ipanema',
    description: 'Luxuoso apartamento com vista deslumbrante para o mar de Ipanema. Totalmente reformado com acabamentos de primeira qualidade.',
    propertyType: 'Apartamento',
    status: 'Disponível',
    price: 'R$ 1.850.000,00',
    estimatedPrice: 'R$ 1.800.000,00',
    totalArea: 120,
    privateArea: 100,
    usefulArea: 95,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    suiteDetails: 'Suíte master com closet',
    parkingSpaces: 1,
    furnished: false,
    address: {
      street: 'Rua Visconde de Pirajá',
      number: '123',
      neighborhood: 'Ipanema',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22410-000',
      country: 'Brasil'
    },
    features: ['Vista para o mar', 'Reformado', 'Portaria 24h', 'Próximo ao metrô'],
    images: ['https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'],
    videoUrl: '',
    virtualTourUrl: '',
    seo: 'Apartamento vista mar Ipanema Rio de Janeiro'
  },
  {
    code: 'LEB001',
    slug: 'cobertura-duplex-leblon',
    title: 'Cobertura Duplex no Leblon',
    description: 'Espetacular cobertura duplex com terraço gourmet e vista panorâmica da Lagoa e Cristo Redentor.',
    propertyType: 'Cobertura',
    status: 'Disponível',
    price: 'R$ 3.200.000,00',
    estimatedPrice: 'R$ 3.100.000,00',
    totalArea: 180,
    privateArea: 160,
    usefulArea: 150,
    bedrooms: 4,
    bathrooms: 3,
    suites: 2,
    suiteDetails: '2 suítes com closet',
    parkingSpaces: 2,
    furnished: false,
    address: {
      street: 'Rua Dias Ferreira',
      number: '456',
      neighborhood: 'Leblon',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22431-000',
      country: 'Brasil'
    },
    features: ['Cobertura duplex', 'Terraço gourmet', 'Vista panorâmica', '2 vagas'],
    images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    videoUrl: '',
    virtualTourUrl: '',
    seo: 'Cobertura duplex Leblon Rio de Janeiro'
  },
  {
    code: 'BOT001',
    slug: 'apartamento-charmoso-botafogo',
    title: 'Apartamento Charmoso em Botafogo',
    description: 'Apartamento aconchegante em prédio clássico de Botafogo. Ideal para quem busca charme e boa localização.',
    propertyType: 'Apartamento',
    status: 'Disponível',
    price: 'R$ 890.000,00',
    estimatedPrice: 'R$ 850.000,00',
    totalArea: 85,
    privateArea: 75,
    usefulArea: 70,
    bedrooms: 2,
    bathrooms: 1,
    suites: 0,
    suiteDetails: '',
    parkingSpaces: 0,
    furnished: false,
    address: {
      street: 'Rua Voluntários da Pátria',
      number: '789',
      neighborhood: 'Botafogo',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22270-000',
      country: 'Brasil'
    },
    features: ['Prédio histórico', 'Alto padrão', 'Próximo shopping', 'Estação de metrô'],
    images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    videoUrl: '',
    virtualTourUrl: '',
    seo: 'Apartamento Botafogo Rio de Janeiro'
  },
  {
    code: 'COP001',
    slug: 'loft-moderno-copacabana',
    title: 'Loft Moderno em Copacabana',
    description: 'Loft contemporâneo completamente reformado, perfeito para jovens profissionais ou investimento.',
    propertyType: 'Loft',
    status: 'Disponível',
    price: 'R$ 750.000,00',
    estimatedPrice: 'R$ 720.000,00',
    totalArea: 65,
    privateArea: 60,
    usefulArea: 55,
    bedrooms: 1,
    bathrooms: 1,
    suites: 0,
    suiteDetails: '',
    parkingSpaces: 0,
    furnished: true,
    address: {
      street: 'Rua Barata Ribeiro',
      number: '321',
      neighborhood: 'Copacabana',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22040-000',
      country: 'Brasil'
    },
    features: ['Design moderno', 'Mobiliado', 'Praia próxima', 'Transporte público'],
    images: ['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'],
    videoUrl: '',
    virtualTourUrl: '',
    seo: 'Loft moderno Copacabana Rio de Janeiro'
  },
  {
    code: 'FLA001',
    slug: 'casa-vila-flamengo',
    title: 'Casa de Vila no Flamengo',
    description: 'Charmosa casa de vila reformada mantendo características originais. Quintal privativo e muito charme.',
    propertyType: 'Casa',
    status: 'Disponível',
    price: 'R$ 1.100.000,00',
    estimatedPrice: 'R$ 1.050.000,00',
    totalArea: 140,
    privateArea: 120,
    usefulArea: 110,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    suiteDetails: 'Suíte master',
    parkingSpaces: 1,
    furnished: false,
    address: {
      street: 'Rua Marquês de Abrantes',
      number: '654',
      neighborhood: 'Flamengo',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22230-000',
      country: 'Brasil'
    },
    features: ['Casa de vila', 'Quintal privativo', 'Reformada', 'Charme histórico'],
    images: ['https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg'],
    videoUrl: '',
    virtualTourUrl: '',
    seo: 'Casa vila Flamengo Rio de Janeiro'
  },
  {
    code: 'URC001',
    slug: 'apartamento-luxo-urca',
    title: 'Apartamento de Luxo na Urca',
    description: 'Imóvel exclusivo com vista para a Baía de Guanabara e Pão de Açúcar. Localização privilegiada e muito verde.',
    propertyType: 'Apartamento',
    status: 'Disponível',
    price: 'R$ 1.450.000,00',
    estimatedPrice: 'R$ 1.400.000,00',
    totalArea: 110,
    privateArea: 95,
    usefulArea: 90,
    bedrooms: 3,
    bathrooms: 2,
    suites: 1,
    suiteDetails: 'Suíte master com vista',
    parkingSpaces: 1,
    furnished: false,
    address: {
      street: 'Rua General Glicério',
      number: '987',
      neighborhood: 'Urca',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22290-000',
      country: 'Brasil'
    },
    features: ['Vista para baía', 'Área verde', 'Exclusividade', 'Pão de Açúcar'],
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'],
    videoUrl: '',
    virtualTourUrl: '',
    seo: 'Apartamento luxo Urca Rio de Janeiro'
  }
];

export default function FeaturedProperties() {


  const handleRedirectToProperties = () => {
    // Redirecionar para a página de imóveis
    window.location.href = '/imoveis'
  }


  return (
    <>
      <Head>
        <title>Imóveis em Destaque - Zona Sul RJ | Apartamentos e Casas de Luxo</title>
        <meta name="description" content="Descubra os melhores imóveis em destaque na Zona Sul do Rio de Janeiro. Apartamentos e casas de luxo em Ipanema, Copacabana, Leblon com as melhores condições." />
        <meta name="keywords" content="imóveis destaque zona sul, apartamentos ipanema, casas leblon, copacabana, imóveis luxo rio de janeiro" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:title" content="Imóveis em Destaque - Zona Sul RJ" />
        <meta property="og:description" content="Descubra os melhores imóveis em destaque na Zona Sul do Rio de Janeiro. Apartamentos e casas de luxo com as melhores condições." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zonasullancamentos.com.br/#featured" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Imóveis em Destaque - Zona Sul RJ",
              "description": "Seleção dos melhores imóveis da Zona Sul do Rio de Janeiro",
              "itemListElement": featuredProperties.map((property, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "RealEstateListing",
                  "name": property.title,
                  "description": property.description,
                  "price": property.price,
                  "priceCurrency": "BRL",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.address.city,
                    "addressRegion": property.address.state,
                    "addressCountry": "BR"
                  },
                  "numberOfRooms": property.bedrooms,
                  "numberOfBathroomsTotal": property.bathrooms,
                  "floorSize": {
                    "@type": "QuantitativeValue",
                    "value": property.totalArea,
                    "unitCode": "MTK"
                  }
                }
              }))
            })
          }}
        />
      </Head>

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
              <PropertyCard key={property.code} property={property} />
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
    </>
  );
}