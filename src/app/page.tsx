
import { HeroSection, NeighborhoodHighlights, FeaturedProperties } from './home'
import Head from 'next/head'

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Portal Imobiliário | Imóveis Zona Sul RJ | Apartamentos e Casas de Luxo</title>
        <meta name="description" content="Encontre os melhores imóveis na Zona Sul do Rio de Janeiro. Apartamentos, casas e lançamentos em Ipanema, Copacabana, Leblon com IA especializada." />
        <meta name="keywords" content="imóveis zona sul rio de janeiro, apartamentos ipanema, copacabana, leblon, casas zona sul, lançamentos, jade ia, inteligência artificial imóveis" />
        <meta name="author" content="Portal Imobiliário" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zonasullancamentos.com.br" />
        <meta property="og:title" content="Portal Imobiliário | Imóveis Zona Sul RJ | Apartamentos e Casas de Luxo" />
        <meta property="og:description" content="Encontre os melhores imóveis na Zona Sul do Rio de Janeiro. Apartamentos, casas e lançamentos com IA especializada." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />
        <meta property="og:site_name" content="Portal Imobiliário" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://zonasullancamentos.com.br" />
        <meta name="twitter:title" content="Portal Imobiliário | Imóveis Zona Sul RJ" />
        <meta name="twitter:description" content="Encontre os melhores imóveis na Zona Sul do Rio de Janeiro. Apartamentos, casas e lançamentos com IA especializada." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://zonasullancamentos.com.br" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Portal Imobiliário",
              "description": "Especialistas em imóveis na Zona Sul do Rio de Janeiro e Niterói com IA especializada",
              "url": "https://zonasullancamentos.com.br",
              "logo": "https://zonasullancamentos.com.br/logo.svg",
              "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
              "telephone": "+55-21-98737-2359",
              "email": "contato@zonasullancamentos.com.br",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Rio de Janeiro",
                "addressRegion": "RJ",
                "addressCountry": "BR"
              },
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Rio de Janeiro",
                  "containedInPlace": {
                    "@type": "State",
                    "name": "Rio de Janeiro"
                  }
                },
                {
                  "@type": "City", 
                  "name": "Niterói",
                  "containedInPlace": {
                    "@type": "State",
                    "name": "Rio de Janeiro"
                  }
                }
              ],
              "serviceType": "Real Estate Services",
              "foundingDate": "1999",
              "numberOfEmployees": "25+",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "2500",
                "bestRating": "5"
              },
              "sameAs": [
                "https://www.instagram.com/zonasullancamentos",
                "https://www.facebook.com/zonasullancamentos",
                "https://wa.me/5521987372359"
              ]
            })
          }}
        />
        
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Portal Imobiliário",
              "url": "https://zonasullancamentos.com.br",
              "description": "Portal especializado em imóveis na Zona Sul do Rio de Janeiro",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://zonasullancamentos.com.br/imoveis?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>
      
      <div>
        <HeroSection />
        <NeighborhoodHighlights />
        <FeaturedProperties />
      </div>
    </>
  )
}
