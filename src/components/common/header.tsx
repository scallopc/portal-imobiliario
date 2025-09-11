'use client'

import { Home, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const getLinkClassName = (path: string) => {
        const isActive = pathname === path;
        const baseClasses = "transition-all duration-300 hover:scale-110 px-3 py-2 ";

        if (isActive) {
            return `${baseClasses} bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent bg-gold/20 border-b-2 border-gold`;
        }

        return `${baseClasses} text-primary-clean hover:bg-gradient-to-r hover:from-[#e1e2e3] hover:to-[#F2C791] hover:bg-clip-text hover:text-transparent bg-darkBrown/30 hover:bg-gold/20`;
    };

    const getMobileLinkClassName = (path: string) => {
        const isActive = pathname === path;
        const baseClasses = "block px-3 py-2  transition-colors duration-300 font-sans font-medium";

        if (isActive) {
            return `${baseClasses} bg-gradient-to-r from-[#e1e2e3] to-[#F2C791] bg-clip-text text-transparent bg-gold/10 border-l-2 border-gold`;
        }

        return `${baseClasses} text-primary-clean hover:text-gold hover:bg-gold/10`;
    };

    return (
        <header className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-darkBg/80 via-darkBg/60 to-transparent backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4 sm:py-6">
                    <Link href="/" className="flex items-center group">
                        <img src="/logogold.svg" alt="Portal Imobiliário" className="h-12 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                        <Link href="/" className={getLinkClassName("/")}>Início</Link>
                        <Link href="/lancamentos" className={getLinkClassName("/lancamentos")}>Lançamentos</Link>
                        <Link href="/imoveis" className={getLinkClassName("/imoveis")}>Imóveis</Link>
                        <Link href="/quem-somos" className={getLinkClassName("/quem-somos")}>Quem Somos</Link>
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Falar com Especialista</Button>
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
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-darkBg/80 backdrop-blur-xl  mt-2 border border-gold/20">
                            <Link
                                href="/"
                                className={getMobileLinkClassName("/")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Início
                            </Link>
                            <Link
                                href="/lancamentos"
                                className={getMobileLinkClassName("/lancamentos")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Lançamentos
                            </Link>
                            <Link
                                href="/imoveis"
                                className={getMobileLinkClassName("/imoveis")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Imóveis
                            </Link>
                            <Link
                                href="/quem-somos"
                                className={getMobileLinkClassName("/quem-somos")}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Quem Somos
                            </Link>
                            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground mt-4">Falar com Especialista</Button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}