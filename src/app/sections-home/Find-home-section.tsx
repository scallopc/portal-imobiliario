import Title from "@/components/common/title";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function FindHomeSection() {
  return (

    <section className="py-24 bg-darkBg relative overflow-hidden">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Title title="Pronto para encontrar seu lar?" />
        <p className="text-xl md:text-2xl text-primary-clean mb-12 leading-relaxed font-light">
          Junte-se a milhares de pessoas que já encontraram o imóvel dos seus sonhos conosco
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button variant="link" className="text-primary-clean hover:text-gold font-bold px-12 py-5 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 text-lg h-auto">
            Explorar Imóveis
          </Button>
          <Button
            variant="ghost"
            className="text-primary-clean font-bold px-12 py-5 bg-darkBg/90 rounded-2xl 
                transition-all duration-500 shadow-2xl hover:shadow-gold/30 transform 
                hover:scale-110 hover:-translate-y-2 hover:bg-darkBg/70 hover:text-primary-clean text-lg h-auto border-2 border-gold/50 
                backdrop-blur-lg">
            Falar com Corretor
          </Button>
        </div>
      </div>
    </section>
  )
}
