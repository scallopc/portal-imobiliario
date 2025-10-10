'use client';

import React from 'react';
import { MapPin, TrendingUp, Building, MessageCircle, Calendar, Users, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReleaseCardSkeleton } from '@/components/skeleton';
import { useReleases } from '@/hooks/queries/use-releases';
import Link from 'next/link';

interface ReleasesHighlightsProps {
    isLoading?: boolean;
}

export default function ReleasesHighlights({ isLoading: externalLoading }: ReleasesHighlightsProps) {
    const { data: releasesData, isLoading: dataLoading, error } = useReleases({}, 1, 6);

    const isLoading = externalLoading || dataLoading;
    const releases = releasesData?.releases || [];

    const handleOpenChat = () => {
        const floatingButton = document.querySelector('[data-jade-chat-button]') as HTMLButtonElement
        if (floatingButton) {
            floatingButton.click()
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp).toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });
        return date.charAt(0).toUpperCase() + date.slice(1);
    };

    // Função para calcular preço mínimo de um lançamento (igual ao release-card.tsx)
    const getMinPrice = (release: any) => {
        const unitsData = release.units || [];
        const prices = unitsData.map((unit: any) => unit.price || 0).filter((price: number) => price > 0);
        return prices.length > 0 ? Math.min(...prices) : (release.minUnitPrice || 0);
    }

    if (error) {
        return (
            <section className="py-20 bg-gradient">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-foreground mb-4">
                            Lançamentos em Destaque
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8">
                            Não foi possível carregar os lançamentos no momento.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Tentar Novamente
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    if (isLoading) {
        return (
            <section className="py-20 bg-gradient">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-foreground mb-4">
                                Lançamentos em Destaque
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                Descubra os melhores lançamentos imobiliários com condições especiais
                                e deixe nossa IA te ajudar a encontrar o imóvel perfeito.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, index) => (
                                <ReleaseCardSkeleton key={index} />
                            ))}
                        </div>

                        <div className="text-center mt-16">
                            <div className="h-12 w-80 bg-muted animate-pulse rounded-xl mx-auto"></div>
                        </div>
                    </div>
                </section>
        );
    }

    return (
        <section className="py-20 bg-gradient">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-foreground mb-4">
                            Lançamentos em Destaque
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            Descubra os melhores lançamentos imobiliários com condições especiais
                            e deixe nossa IA te ajudar a encontrar o imóvel perfeito.
                        </p>
                        {releases.length > 0 && (
                            <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
                                <span>{releases.length} lançamentos em destaque</span>
                                <span>{releases.reduce((acc, release) => acc + (release.unitsCount || 0), 0)} unidades</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {releases.map((release) => {
                            const minPrice = getMinPrice(release);

                            return (
                                <div key={release.id} className="group cursor-pointer">
                                    <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-accent/20">
                                        {/* Image Container */}
                                        <div className="relative h-64 overflow-hidden">
                                            <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-500">
                                                <img
                                                    src={release.images?.[0] || 'https://images.pexels.com/photos/2566056/pexels-photo-2566056.jpeg'}
                                                    alt={release.title || 'Lançamento'}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Gradient Overlays */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20"></div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/90 backdrop-blur-sm">
                                                    <Building className="w-4 h-4 text-white" />
                                                    <span className="text-xs font-medium text-white">
                                                        {release.isActive ? 'Disponível' : 'Esgotado'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Release Name */}
                                            <div className="absolute bottom-6 left-6 right-6">
                                                <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                                                    {release.title || 'Lançamento Exclusivo'}
                                                </h3>
                                                <div className="flex items-center text-foreground/90 text-sm">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span>{release.address?.neighborhood || 'Localização Premium'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Container */}
                                        <div className="p-6">
                                            {/* Stats Row */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Users className="w-4 h-4 text-accent mr-1" />
                                                    </div>
                                                    <div className="text-lg font-bold text-card-foreground">
                                                        {release.unitsCount || 0}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">unidades</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Bed className="w-4 h-4 text-accent mr-1" />
                                                    </div>
                                                    <div className="text-lg font-bold text-card-foreground">
                                                        {release.units?.[0]?.bedrooms || '2-3'}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">quartos</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Calendar className="w-4 h-4 text-accent mr-1" />
                                                    </div>
                                                    <div className="text-lg font-bold text-card-foreground">
                                                        {formatDate(release.delivery)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">entrega</div>
                                                </div>
                                            </div>

                                            {/* Price - Só mostra se minPrice > 0 (igual ao release-card.tsx) */}
                                            {minPrice > 0 && (
                                                <div className="mb-6 p-5 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-accent/20 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50"></div>
                                                    <div className="relative text-center">
                                                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                                                            A partir de
                                                        </div>
                                                        <div className="text-2xl font-bold text-accent">
                                                            {formatPrice(minPrice)}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Button */}
                                            <div className="space-y-3">
                                                <Link href={`/releases/${release.slug || release.id}`}>
                                                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                                        Ver Detalhes
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Decorative Elements */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-16">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/releases">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-3 text-lg font-semibold rounded-xl border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                                >
                                    Ver Todos os Lançamentos
                                </Button>
                            </Link>

                            <Button
                                size="lg"
                                onClick={handleOpenChat}
                                className="group relative bg-gradient-to-r from-accent via-accent to-accent/90 hover:from-accent/90 hover:via-accent hover:to-accent text-accent-foreground px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/25 rounded-xl border border-accent/30 backdrop-blur-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
                                <MessageCircle className="w-5 h-5 mr-2 relative z-10" />
                                <span className="relative z-10">Falar com a Jade IA</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
    );
}
