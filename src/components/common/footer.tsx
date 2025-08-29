import { Home, Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-bottom relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-1/4 w-64 h-64 bg-gold/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-primary-clean/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-6">
                            <img src="/logoall.svg" alt="Portal Imobiliário" className="w-72 brightness-0 invert-100" />
                        </div>
                        <p className="text-primary-clean leading-relaxed mb-6 text-md max-w-md">
                            Conectando pessoas aos seus lares ideais no Rio de Janeiro.
                            Especialistas em imóveis de alto padrão.
                        </p>

                        {/* Social Links */}
                        <div className="flex space-x-4">
                            <a href="#" className="bg-darkBrown/30 hover:bg-gold/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                                <Instagram className="h-5 w-5 text-gold" />
                            </a>
                            <a href="#" className="bg-darkBrown/30 hover:bg-gold/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                                <Facebook className="h-5 w-5 text-gold" />
                            </a>
                            <a href="#" className="bg-darkBrown/30 hover:bg-gold/20 p-3 rounded-xl transition-all duration-300 hover:scale-110">
                                <Linkedin className="h-5 w-5 text-gold" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="text-xl font-bold mb-6 text-gold">Navegação</h4>
                        <div className="space-y-3">
                            <Link href="/lancamentos" className="text-primary-clean hover:text-gold bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 flex items-center">
                                Lançamentos
                            </Link>
                            <Link href="/imoveis" className="text-primary-clean hover:text-gold bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 flex items-center">
                                Imóveis
                            </Link>
                            <Link href="/locacao" className="text-primary-clean hover:text-gold bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 flex items-center">
                                Locação
                            </Link>
                            <Link href="/quem-somos" className="text-primary-clean hover:text-gold bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 flex items-center">
                                Quem Somos
                            </Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-xl font-bold mb-6 text-gold">Contato</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gold" />
                                <span className="text-primary-clean font-sans">(21) 9999-9999</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gold" />
                                <span className="text-primary-clean font-sans">contato@portalimobiliario.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gold" />
                                <span className="text-primary-clean font-sans">Rio de Janeiro, RJ</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gold/20 mt-12 pt-8">
                    <div className="flex flex-col items-center">
                        <p className="text-primary-clean font-sans text-center mb-4">
                            &copy; {currentYear} Portal Imobiliário. Todos os direitos reservados.
                        </p>
                        <div className="w-16 h-1 bg-gradient-to-r from-[#F2C791] to-[#A67C58] rounded-full"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}