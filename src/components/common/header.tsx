'use client'

import { Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-darkBg/80 via-darkBg/60 to-transparent backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 sm:py-6">
                    <Link href="/" className="flex items-center group">
                        <img src="/logogold.svg" alt="Portal Imobiliário" className="h-12 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 lg:space-x-8">
                        <Link href="/" className="text-primary-clean hover:bg-gradient-to-r hover:from-[#e1e2e3] hover:to-[#F2C791] hover:bg-clip-text hover:text-transparent bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-xl">Início</Link>
                        <Link href="/lancamentos" className="text-primary-clean hover:bg-gradient-to-r hover:from-[#e1e2e3] hover:to-[#F2C791] hover:bg-clip-text hover:text-transparent bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-xl">Lançamentos</Link>
                        <Link href="/imoveis" className="text-primary-clean hover:bg-gradient-to-r hover:from-[#e1e2e3] hover:to-[#F2C791] hover:bg-clip-text hover:text-transparent bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-xl">Imóveis</Link>
                        <Link href="/locacao" className="text-primary-clean hover:bg-gradient-to-r hover:from-[#e1e2e3] hover:to-[#F2C791] hover:bg-clip-text hover:text-transparent bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-xl">Locação</Link>
                        <Link href="/quem-somos" className="text-primary-clean hover:bg-gradient-to-r hover:from-[#e1e2e3] hover:to-[#F2C791] hover:bg-clip-text hover:text-transparent bg-darkBrown/30 hover:bg-gold/20 transition-all duration-300 hover:scale-110 px-3 py-2 rounded-xl">Quem Somos</Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-primary-clean hover:text-gold transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-darkBg/80 backdrop-blur-xl rounded-lg mt-2 border border-gold/20">
                            <Link
                                href="/"
                                className="block px-3 py-2 text-primary-clean hover:text-gold hover:bg-gold/10 rounded-md transition-colors duration-300 font-sans font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Início
                            </Link>
                            <Link
                                href="/lancamentos"
                                className="block px-3 py-2 text-primary-clean hover:text-gold hover:bg-gold/10 rounded-md transition-colors duration-300 font-sans font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Lançamentos
                            </Link>
                            <Link
                                href="/imoveis"
                                className="block px-3 py-2 text-primary-clean hover:text-gold hover:bg-gold/10 rounded-md transition-colors duration-300 font-sans font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Imóveis
                            </Link>
                            <Link
                                href="/locacao"
                                className="block px-3 py-2 text-primary-clean hover:text-gold hover:bg-gold/10 rounded-md transition-colors duration-300 font-sans font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Locação
                            </Link>
                            <Link
                                href="/quem-somos"
                                className="block px-3 py-2 text-primary-clean hover:text-gold hover:bg-gold/10 rounded-md transition-colors duration-300 font-sans font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Quem Somos
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}