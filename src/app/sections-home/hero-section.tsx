import Section from '@/components/common/section'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function HeroSection() {
  return (

    <Section className="relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80')"
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
        <h1 className="font-title text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent">Encontre o Imóvel dos seus Sonhos</span>
        </h1>
        <p className="text-xl md:text-2xl text-primary-clean mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          Descubra lançamentos e propriedades de alto padrão nos endereços mais desejados do Rio de Janeiro
        </p>

        {/* Enhanced Search Bar */}
        <div className="bg-gradient-to-r from-gold/10 via-darkBrown/20 to-brown/15 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-6xl mx-auto border border-gold/30 relative overflow-hidden">
          <div className="relative">
            <h3 className="text-2xl md:text-3xl text-gold mb-6 text-center font-semibold">
              Encontre seu lar ideal
            </h3>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Busque por bairro ou empreendimento..."
                  className="w-full px-6 py-5 bg-darkBg/90 border-2 border-gold/40 rounded-2xl text-primary-clean placeholder-darkBrown focus:ring-4 focus:ring-gold/30 focus:border-gold transition-all duration-500 !text-lg shadow-inner h-auto"
                />
              </div>
              <div className="flex-1">
                <Select>
                  <SelectTrigger className="w-full px-6 py-5 bg-darkBg/90 border-2 border-gold/40 rounded-2xl text-primary-clean focus:ring-4 focus:ring-gold/30 focus:border-gold transition-all duration-500 text-lg shadow-inner !h-auto">
                    <SelectValue placeholder="Tipo de Imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa-luxo">Casa de Luxo</SelectItem>
                    <SelectItem value="apartamento-premium">Apartamento Premium</SelectItem>
                    <SelectItem value="terreno-exclusivo">Terreno Exclusivo</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                className="text-primary-clean font-bold px-12 py-5 bg-darkBg/90 rounded-2xl 
                transition-all duration-500 shadow-2xl hover:shadow-gold/30 transform 
                hover:scale-110 hover:-translate-y-2 hover:bg-darkBg/70 hover:text-primary-clean text-lg h-auto border-2 border-gold/50 
                backdrop-blur-lg">
                Buscar Imóveis
                <Search className="h-7 w-7 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
