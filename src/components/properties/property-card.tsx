'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/common/whatsapp-button';
import { MapPin, Bed, Bath, Car, Square } from 'lucide-react';
import { PropertyCardSkeleton } from '../skeleton';
import { PropertyBaseSchema } from "@/schemas/property"

interface PropertyCardProps {
  property: PropertyBaseSchema;
  isLoading?: boolean;
}

export function PropertyCard({ property, isLoading }: PropertyCardProps) {
  if (isLoading) {
    return <PropertyCardSkeleton />;
  }
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20">
      {/* Image Container */}
      <div className="relative h-72 overflow-hidden">
        <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-700">
          <img
            src={property.images?.[0] ?? '/logo.svg'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Price Badge */}
        <div className="absolute top-6 left-6">
          <div className="bg-accent/95 backdrop-blur-sm text-accent-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg border border-accent/30">
            {property.price}
          </div>
        </div>

        {/* Neighborhood Badge */}
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center space-x-2 bg-card/90 backdrop-blur-sm text-card-foreground px-4 py-2 rounded-full border border-accent/20 shadow-lg">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="font-semibold text-sm">{property.address?.neighborhood || property.address?.city || 'Localização não informada'}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-8">
        {/* Title */}
        <h3 className="text-2xl font-bold text-card-foreground mb-4 line-clamp-2 group-hover:text-accent transition-colors duration-300 leading-tight">
          {property.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-6 text-base leading-relaxed line-clamp-2">
          {property.description}
        </p>

        {/* Property Specifications */}
        <div className="grid grid-cols-4 gap-6 mb-6 py-4 px-2 bg-accent/5 rounded-xl border border-accent/10">
          <div className="text-center group/spec">
            <div className="bg-accent/10 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center group-hover/spec:bg-accent/20 transition-colors">
              <Bed className="w-5 h-5 text-accent" />
            </div>
            <div className="text-lg font-bold text-card-foreground">{property.bedrooms}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quartos</div>
          </div>
          <div className="text-center group/spec">
            <div className="bg-accent/10 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center group-hover/spec:bg-accent/20 transition-colors">
              <Bath className="w-5 h-5 text-accent" />
            </div>
            <div className="text-lg font-bold text-card-foreground">{property.bathrooms}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Banheiros</div>
          </div>
          <div className="text-center group/spec">
            <div className="bg-accent/10 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center group-hover/spec:bg-accent/20 transition-colors">
              <Square className="w-5 h-5 text-accent" />
            </div>
            <div className="text-lg font-bold text-card-foreground">{property.totalArea}m²</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Área</div>
          </div>
          <div className="text-center group/spec">
            <div className="bg-accent/10 rounded-full p-3 mx-auto mb-2 w-12 h-12 flex items-center justify-center group-hover/spec:bg-accent/20 transition-colors">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <div className="text-lg font-bold text-card-foreground">{property.parkingSpaces}</div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Vagas</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          {/* <h4 className="text-sm font-semibold text-card-foreground mb-3 uppercase tracking-wide">Características</h4> */}
          <div className="flex flex-wrap gap-2">
            {(property.features?.slice(0, 3) ?? []).map((feature) => (
              <span
                key={feature}
                className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                {feature}
              </span>
            ))}
            {(property.features?.length ?? 0) > 4 && (
              <span className="text-sm text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full border border-muted/20">
                +{(property.features?.length ?? 0) - 4} mais
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link href={`/property/${property.slug}`}>
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Ver Detalhes
            </Button>
          </Link>
          <WhatsAppButton
            variant="outline"
            className="flex-1 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            message={`Olá! Tenho interesse no imóvel: ${property.title}. Gostaria de mais informações.`}
          >
            Tenho Interesse
          </WhatsAppButton>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}