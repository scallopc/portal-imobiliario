'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Building, Users, TrendingUp, Clock, CheckCircle, Eye, Heart } from 'lucide-react';

interface Release {
  id: string;
  name: string;
  developer: string;
  neighborhood: string;
  status: 'na_planta' | 'em_construcao' | 'recem_entregue';
  deliveryDate: string;
  priceRange: { min: number; max: number };
  units: { total: number; available: number };
  bedrooms: number[];
  areas: { min: number; max: number };
  images: string[];
  description: string;
  features: string[];
  financing: string[];
  vgv: number;
}

interface ReleaseCardProps {
  release: Release;
  isLoading?: boolean;
}

export function ReleaseCard({ release, isLoading }: ReleaseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'na_planta':
        return {
          icon: Building,
          label: 'Na Planta',
          color: 'bg-blue-600/90 text-white border-blue-400/50 shadow-blue-500/30',
          bgColor: 'bg-blue-500/5'
        };
      case 'em_construcao':
        return {
          icon: Clock,
          label: 'Em Construção',
          color: 'bg-orange-600/90 text-white border-orange-400/50 shadow-orange-500/30',
          bgColor: 'bg-orange-500/5'
        };
      case 'recem_entregue':
        return {
          icon: CheckCircle,
          label: 'Recém Entregue',
          color: 'bg-green-600/90 text-white border-green-400/50 shadow-green-500/30',
          bgColor: 'bg-green-500/5'
        };
      default:
        return {
          icon: Building,
          label: 'Lançamento',
          color: 'bg-accent/90 text-accent-foreground border-accent/50 shadow-accent/30',
          bgColor: 'bg-accent/5'
        };
    }
  };

  const statusInfo = getStatusInfo(release.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-700">
          <img
            src={release.images[0]}
            alt={release.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-6 left-6">
          <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-full border-2 backdrop-blur-md shadow-lg ${statusInfo.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">{statusInfo.label}</span>
          </div>
        </div>

        {/* Developer & Location */}
        <div className="absolute bottom-6 left-6 right-6">
          <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">{release.name}</h3>
          <div className="flex items-center space-x-2 text-foreground/90">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{release.neighborhood}</span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Price Range */}
        <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-accent/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Faixa de Preço</div>
              <div className="text-xl font-bold text-accent">
                {formatPrice(release.priceRange.min)} - {formatPrice(release.priceRange.max)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-card-foreground">{release.units.available}</div>
              <div className="text-xs text-muted-foreground">unidades disponíveis</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed line-clamp-2">
          {release.description}
        </p>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 mb-6 py-4 px-2 bg-accent/5 rounded-xl border border-accent/10">
          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-2 mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-bold text-card-foreground">
              {release.bedrooms.join(', ')} qts
            </div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quartos</div>
          </div>
          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-2 mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-bold text-card-foreground">
              {release.areas.min}-{release.areas.max}m²
            </div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Área</div>
          </div>
          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-2 mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-bold text-card-foreground">
              {formatDate(release.deliveryDate)}
            </div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Entrega</div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-card-foreground mb-3 uppercase tracking-wide">Principais Diferenciais</h4>
          <div className="flex flex-wrap gap-2">
            {release.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-xs font-medium border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                {feature}
              </span>
            ))}
            {release.features.length > 3 && (
              <span className="text-xs text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full border border-muted/20">
                +{release.features.length - 3} mais
              </span>
            )}
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Ver Detalhes
          </Button>
          <Button variant="outline" className="flex-1 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105">
            Tenho Interesse
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
