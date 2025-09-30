'use client'

import { useState, useEffect } from 'react'
import Section from '@/components/common/section'
import { MapPin, MessageCircle, Search, Star, Home, Building2, TrendingUp, Users, ArrowRight, Sparkles, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Head from 'next/head'

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [particles, setParticles] = useState<Array<{
    left: number
    top: number
    animationDelay: number
    animationDuration: number
  }>>([])

  const slides = [
    {
      title: "Encontre o Imóvel dos seus Sonhos",
      subtitle: "Conte com nossa concierge Jade IA especializada para encontrar o imóvel perfeito para você.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80"
    },
    {
      title: "Zona Sul e Niterói",
      subtitle: "Especialistas nas melhores regiões do Rio de Janeiro com mais de 25 anos de experiência no mercado.",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    },
    {
      title: "Tecnologia e Tradição",
      subtitle: "Combinamos a experiência de décadas no mercado com a mais avançada inteligência artificial.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80"
    }
  ]

  const stats = [
    { icon: Building2, number: "2.500+", label: "Imóveis Disponíveis" },
    { icon: MapPin, number: "15+", label: "Bairros Atendidos" },
    { icon: Star, number: "98%", label: "Clientes Satisfeitos" },
    { icon: Clock, number: "25+", label: "Anos de Experiência" }
  ]

  const features = [
    { icon: Sparkles, title: "IA Especializada", description: "Jade IA encontra o imóvel ideal para você" },
    { icon: Shield, title: "Segurança Total", description: "Todos os imóveis são verificados e validados" },
    { icon: TrendingUp, title: "Melhores Ofertas", description: "Preços competitivos e condições especiais" },
    { icon: Users, title: "Atendimento VIP", description: "Suporte personalizado do início ao fim" }
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Gerar partículas com valores aleatórios
    const generatedParticles = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2
    }))
    setParticles(generatedParticles)
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [slides.length])

  const handleOpenChat = () => {
    const floatingButton = document.querySelector('[data-jade-chat-button]') as HTMLButtonElement
    if (floatingButton) {
      floatingButton.click()
    }
  }

  const handleRedirectToProperties = () => {
    window.location.href = '/imoveis'
  }

  return (
    <>
      <Head>
        <title>Encontre seu Lar dos Sonhos na Zona Sul RJ | Portal Imobiliário</title>
        <meta name="description" content="Descubra os melhores imóveis na Zona Sul do Rio de Janeiro com nossa IA especializada. Apartamentos e casas em Ipanema, Copacabana, Leblon com as melhores condições." />
        <meta name="keywords" content="imóveis zona sul rio de janeiro, apartamentos ipanema, copacabana, leblon, casas zona sul, jade ia, inteligência artificial imóveis" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Encontre seu Lar dos Sonhos na Zona Sul RJ" />
        <meta property="og:description" content="Descubra os melhores imóveis na Zona Sul do Rio de Janeiro com nossa IA especializada. Apartamentos e casas com as melhores condições." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://zonasullancamentos.com.br" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Portal Imobiliário",
              "description": "Especialistas em imóveis na Zona Sul do Rio de Janeiro com IA especializada",
              "url": "https://zonasullancamentos.com.br",
              "telephone": "+55-21-98737-2359",
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
              "serviceType": "Real Estate Services"
            })
          }}
        />
      </Head>
      
      <Section className="relative min-h-screen overflow-hidden">
      {/* Animated Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          style={{ backgroundImage: `url('${slide.image}')` }}
        />
      ))}

      {/* Enhanced Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />

      {/* Animated Blur Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full animate-bounce"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Hero Badge */}
          <div className={`mb-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 px-6 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Jade IA
            </Badge>
          </div>

          {/* Main Title */}
          <div className={`mb-8 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="font-title text-4xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent animate-pulse">
                {slides[currentSlide].title}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className={`mb-12 transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-lg md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`mb-16 transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={handleOpenChat}
                className="group relative bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/90 hover:via-accent hover:to-accent text-accent-foreground px-12 py-6 text-lg font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-accent/30 rounded-2xl border border-accent/30 backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 animate-pulse" />
                <MessageCircle className="w-6 h-6 mr-3 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">Fale com Jade IA</span>
                <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                onClick={handleRedirectToProperties}
                variant="outline"
                size="lg"
                className="group relative border-2 border-white/30 text-white hover:bg-white/10 hover:border-white hover:text-white px-12 py-6 text-lg font-semibold transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-white/20 rounded-2xl backdrop-blur-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Search className="w-6 h-6 mr-3 relative z-10 group-hover:animate-spin" />
                <span className="relative z-10">Explorar Imóveis</span>
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className={`mb-16 transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div
                    key={index}
                    className="group text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
                  >
                    <IconComponent className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-accent transition-colors">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Features Grid */}
          <div className={`transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <div
                    key={index}
                    className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-accent/10 hover:border-accent/30 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
                  >
                    <IconComponent className="w-8 h-8 text-accent mb-4 group-hover:scale-110 group-hover:animate-pulse transition-all" />
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
              ? 'bg-accent scale-125 shadow-lg shadow-accent/50'
              : 'bg-white/30 hover:bg-white/50'
              }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-accent rounded-full mt-2 animate-pulse" />
        </div>
      </div>

    </Section>
    </>
  )
}
