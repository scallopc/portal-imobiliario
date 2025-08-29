import { MapPin, Phone, Search } from 'lucide-react'
import Title from '@/components/common/title'

export default function SummarySection() {
  return (

    <section className="py-24 bg-gradient-top relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <Title title="Por que escolher nosso portal?" />
          <p className="text-xl md:text-2xl text-primary-clean mb-4 max-w-4xl mx-auto leading-relaxed font-light">
            Oferecemos a melhor experiência em busca de imóveis com tecnologia de ponta
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gold to-darkBrown mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-16">
          <div className="text-center group relative">
            <div className="bg-gradient-to-br from-gold via-darkBrown to-brown w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-gold/30 transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2 relative overflow-hidden">
              <Search className="h-12 w-12 text-darkBg relative z-10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gold">Busca Inteligente</h3>
            <p className="text-primary-clean leading-relaxed text-lg">Encontre exatamente o que procura com nossos filtros avançados e busca por localização.</p>
          </div>

          <div className="text-center group relative">
            <div className="bg-gradient-to-br from-gold via-darkBrown to-brown w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-gold/30 transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2 relative overflow-hidden">
              <MapPin className="h-12 w-12 text-darkBg relative z-10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gold">Localização Precisa</h3>
            <p className="text-primary-clean leading-relaxed text-lg">Visualize imóveis em mapas interativos com informações detalhadas sobre a região.</p>
          </div>

          <div className="text-center group relative">
            <div className="bg-gradient-to-br from-gold via-darkBrown to-brown w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-gold/30 transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-2 relative overflow-hidden">
              <Phone className="h-12 w-12 text-darkBg relative z-10" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gold">Contato Direto</h3>
            <p className="text-primary-clean leading-relaxed text-lg">Fale diretamente com corretores especializados e proprietários de forma rápida.</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Números que Impressionam
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="text-center group">
            <div className="text-4xl md:text-5xl font-bold  mb-2 tracking-tight">
              1000<span className="text-color-accent text-lg md:text-xl align-top">+</span>
            </div>
            <div className="text-sm md:text-base font-normal">Imóveis Disponíveis</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl md:text-5xl font-bold  mb-2 tracking-tight">
              500<span className="text-color-accent text-lg md:text-xl align-top">+</span>
            </div>
            <div className="text-sm md:text-base font-normal">Clientes Satisfeitos</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl md:text-5xl font-bold  mb-2 tracking-tight">
              50<span className="text-color-accent text-lg md:text-xl align-top">+</span>
            </div>
            <div className="text-sm md:text-base font-normal">Imóveis Lançados</div>
          </div>
          <div className="text-center group">
            <div className="text-4xl md:text-5xl font-bold  mb-2 tracking-tight">
              25<span className="text-color-accent text-lg md:text-xl align-top">+</span>
            </div>
            <div className="text-sm md:text-base font-normal">Anos de Experiência</div>
          </div>
        </div>
      </div>

    </section>
  )
}
