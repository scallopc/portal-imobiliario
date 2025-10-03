'use client'

import Section from '@/components/common/section'
import { Button } from '@/components/ui/button'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Award,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  Heart,
  Star,
  Building,
  Clock,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react'
import Head from 'next/head'

export default function AboutPage() {
  const handleOpenChat = () => {
    const floatingButton = document.querySelector('[data-jade-chat-button]') as HTMLButtonElement
    if (floatingButton) {
      floatingButton.click()
    }
  }

  const stats = [
    { number: '2.500+', label: 'Imóveis Disponíveis', icon: Building },
    { number: '15+', label: 'Bairros Atendidos', icon: MapPin },
    { number: '98%', label: 'Clientes Satisfeitos', icon: Star },
    { number: '25+', label: 'Anos de Experiência', icon: Clock }
  ]

  const values = [
    {
      icon: Shield,
      title: 'Confiança',
      description: 'Transparência total em todas as negociações, com informações claras e precisas sobre cada imóvel.'
    },
    {
      icon: Target,
      title: 'Precisão',
      description: 'Nossa IA especializada encontra exatamente o que você procura, economizando seu tempo e energia.'
    },
    {
      icon: Heart,
      title: 'Dedicação',
      description: 'Cuidamos de cada cliente como se fosse único, oferecendo atendimento personalizado e humanizado.'
    },
    {
      icon: Lightbulb,
      title: 'Inovação',
      description: 'Utilizamos as mais avançadas tecnologias para revolucionar a experiência de busca por imóveis.'
    }
  ]

  return (
    <>
      <Head>
        <title>Quem Somos - Especialistas em Imóveis Zona Sul RJ | Portal Imobiliário</title>
        <meta name="description" content="Somos especialistas em conectar pessoas aos seus lares dos sonhos na Zona Sul do Rio de Janeiro e Niterói. 25+ anos de experiência com IA especializada para encontrar o imóvel ideal." />
        <meta name="keywords" content="imóveis zona sul rio de janeiro, apartamentos ipanema, copacabana, leblon, niterói, corretor imobiliário, jade ia, inteligência artificial imóveis" />
        <meta name="author" content="Portal Imobiliário" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zonasullancamentos.com.br/about" />
        <meta property="og:title" content="Quem Somos - Especialistas em Imóveis Zona Sul RJ" />
        <meta property="og:description" content="Somos especialistas em conectar pessoas aos seus lares dos sonhos na Zona Sul do Rio de Janeiro e Niterói. 25+ anos de experiência com IA especializada." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />
        <meta property="og:site_name" content="Portal Imobiliário" />
        <meta property="og:locale" content="pt_BR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://zonasullancamentos.com.br/about" />
        <meta name="twitter:title" content="Quem Somos - Especialistas em Imóveis Zona Sul RJ" />
        <meta name="twitter:description" content="Somos especialistas em conectar pessoas aos seus lares dos sonhos na Zona Sul do Rio de Janeiro e Niterói. 25+ anos de experiência com IA especializada." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://zonasullancamentos.com.br/about" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Portal Imobiliário",
              "description": "Especialistas em imóveis na Zona Sul do Rio de Janeiro e Niterói com 25+ anos de experiência e IA especializada",
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

        {/* Structured Data - FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Há quanto tempo vocês atuam no mercado imobiliário?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Atuamos há mais de 25 anos no mercado imobiliário, especializados na Zona Sul do Rio de Janeiro e Niterói."
                  }
                },
                {
                  "@type": "Question",
                  "name": "O que é a Jade IA?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A Jade IA é nossa assistente virtual especializada em imóveis, disponível 24/7 para ajudar você a encontrar o imóvel ideal com base em suas necessidades e preferências."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Quais regiões vocês atendem?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Atendemos principalmente a Zona Sul do Rio de Janeiro (Ipanema, Copacabana, Leblon, Botafogo, Flamengo) e Niterói, com foco nas melhores localizações."
                  }
                }
              ]
            })
          }}
        />
      </Head>
      <div className="min-h-screen ">
        {/* Hero Section */}
        <Section className="relative pt-32 pb-20">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80')"
            }}
          ></div>

          {/* Dark Overlays */}
          <div className="absolute inset-0 bg-darkB"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-darkRed/50 to-black/70"></div>

          {/* Blur Effects */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gold/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-darkBrown/40 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent">
                Quem Somos
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-clean mb-8 max-w-4xl mx-auto leading-relaxed">
              Somos especialistas em conectar pessoas aos seus lares dos sonhos na Zona Sul do Rio de Janeiro e Niterói.
            </p>

            <Button
              size="lg"
              onClick={handleOpenChat}
              className="group relative bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/90 hover:via-accent hover:to-accent text-accent-foreground px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/25 rounded-xl border border-accent/30 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
              <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">Converse com Nossa Jade IA</span>
            </Button>
          </div>
        </Section>


        {/* Nossa História */}
        <Section className="py-20 bg-gradient-top from-accent/10 via-accent/5 to-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-primary-clean mb-6">
                  Nossa <span className="text-accent">História</span>
                </h2>
                <div className="space-y-6 text-lg text-primary-clean leading-relaxed">
                  <p>
                    Nascemos da paixão por conectar pessoas aos seus lares ideais. Especializados nas regiões mais desejadas do Rio de Janeiro e Niterói, combinamos conhecimento local profundo com tecnologia de ponta.
                  </p>
                  <p>
                    Nossa jornada começou com uma visão simples: tornar a busca por imóveis mais inteligente, rápida e personalizada. Hoje, somos pioneiros no uso de inteligência artificial para o mercado imobiliário.
                  </p>
                  <p>
                    Cada imóvel em nossa plataforma é cuidadosamente selecionado e verificado, garantindo que você tenha acesso apenas às melhores oportunidades do mercado.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="relative inline-block rounded-2xl shadow-2xl bg-gradient-to-br from-accent/5 to-accent/10 p-4">
                  <img
                    src="/corretor.jpeg"
                    alt="Especialista em Imóveis Zona Sul"
                    className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent rounded-2xl pointer-events-none"></div>
                </div>

                {/* Floating Stats Cards */}
                <div className="absolute -bottom-6 -left-6 bg-card/95 backdrop-blur-sm text-card-foreground p-5 rounded-2xl shadow-2xl border border-accent/30 hover:shadow-accent/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-full p-3">
                      <MessageCircle className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">IA Especializada</p>
                      <p className="text-xs text-accent font-medium">24/7 Disponível</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 bg-card/95 backdrop-blur-sm text-card-foreground p-5 rounded-2xl shadow-2xl border border-accent/30 hover:shadow-accent/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-full p-3">
                      <Award className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">25+ Anos</p>
                      <p className="text-xs text-accent font-medium">Experiência</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-accent/30 rounded-full blur-sm animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-8 w-6 h-6 bg-accent/20 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </Section>

        {/* Estatísticas */}
        <Section className="py-20 bg-gradient-to-br from-accent/5 via-background to-accent/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-2">
                Nossos Resultados
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Números que <span className="text-accent">Impressionam</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Mais de duas décadas conectando pessoas aos seus lares ideais com tecnologia de ponta
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center group">
                    <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-accent/30 hover:shadow-accent/20 transition-all duration-500 hover:-translate-y-3 hover:rotate-1 overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10">
                        <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-4 w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-12 h-12 text-accent mx-auto" />
                        </div>
                        <div className="text-5xl font-black text-foreground mb-3 group-hover:text-accent transition-colors duration-300">{stat.number}</div>
                        <div className="text-muted-foreground font-semibold uppercase tracking-wide text-sm">{stat.label}</div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent/30 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>

        {/* Nossos Valores */}
        <Section className="py-20 bg-gradient-to-r from-background via-accent/5 to-background relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-2">
                Nossos Pilares
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Valores que nos <span className="text-accent">Definem</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Cada decisão que tomamos é guiada por estes princípios fundamentais que construíram nossa reputação
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div key={index} className="group">
                    <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-accent/30 hover:shadow-accent/20 transition-all duration-500 hover:-translate-y-2 h-full overflow-hidden">
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative z-10">
                        <div className="flex items-start space-x-6">
                          <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl p-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            <Icon className="w-8 h-8 text-accent" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-accent transition-colors duration-300">{value.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-lg">{value.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>

        {/* Diferenciais */}
        <Section className="py-20 bg-gradient-to-bl from-accent/5 via-background to-accent/10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-2">
                Nossos Diferenciais
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                O que nos torna <span className="text-accent">Únicos</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Combinamos tecnologia de ponta com expertise local para revolucionar sua experiência imobiliária
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center group">
                <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-accent/30 hover:shadow-accent/25 transition-all duration-500 hover:-translate-y-4 hover:rotate-1 overflow-hidden">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl p-6 w-24 h-24 mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                      <MessageCircle className="w-12 h-12 text-accent mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-accent transition-colors duration-300">IA Especializada</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Nossa Jade IA revoluciona a busca por imóveis, entendendo suas necessidades e encontrando opções personalizadas 24/7.
                    </p>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-accent/30 hover:shadow-accent/25 transition-all duration-500 hover:-translate-y-4 hover:-rotate-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl p-6 w-24 h-24 mx-auto mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                      <MapPin className="w-12 h-12 text-accent mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-accent transition-colors duration-300">Expertise Local</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      25+ anos de conhecimento profundo das melhores regiões do Rio e Niterói, garantindo as melhores oportunidades.
                    </p>
                  </div>

                  <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-accent/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
              </div>

              <div className="text-center group">
                <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-accent/30 hover:shadow-accent/25 transition-all duration-500 hover:-translate-y-4 hover:rotate-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl p-6 w-24 h-24 mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                      <CheckCircle className="w-12 h-12 text-accent mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-6 group-hover:text-accent transition-colors duration-300">Qualidade Garantida</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Rigorosa verificação de todos os imóveis, garantindo informações precisas e atualizadas para sua segurança.
                    </p>
                  </div>

                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-accent/25 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-600"></div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Call to Action */}
        <Section className="py-20 from-accent/5 via-background to-accent/10 relative">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-2">
              Comece Agora
            </Badge>

            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              Seu <span className="text-accent">Lar dos Sonhos</span><br />está a um Clique de Distância
            </h2>

            <p className="text-2xl text-muted-foreground mb-12 leading-relaxed max-w-4xl mx-auto">
              Junte-se a milhares de pessoas que já encontraram seu lar ideal conosco.
              <span className="text-accent font-semibold"> Nossa Jade IA está esperando por você!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={handleOpenChat}
                className="group relative bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/90 hover:via-accent hover:to-accent text-accent-foreground px-12 py-6 text-xl font-bold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-accent/30 rounded-2xl border-2 border-accent/40 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
                <MessageCircle className="w-6 h-6 mr-3 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">Conversar com Jade IA</span>
              </Button>

              <WhatsAppButton
                size="lg"
                className="group border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-green-600/20 backdrop-blur-sm"
                message="Olá! Gostaria de saber mais sobre os imóveis disponíveis na Zona Sul do Rio de Janeiro e Niterói."
              >
                Falar com Especialista
              </WhatsAppButton>

              <Button
                variant="outline"
                size="lg"
                className="group border-2 border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground px-12 py-6 text-xl font-bold rounded-2xl transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-accent/20 backdrop-blur-sm"
                onClick={() => window.location.href = '/imoveis'}
              >
                <Building className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                Explorar Imóveis
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                <Star className="w-5 h-5 text-accent fill-current" />
                <span className="font-semibold">98% Satisfação</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                <Shield className="w-5 h-5 text-accent" />
                <span className="font-semibold">Totalmente Seguro</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-accent" />
                <span className="font-semibold">Resposta Imediata</span>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
