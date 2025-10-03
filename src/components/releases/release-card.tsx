'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/common/whatsapp-button';
import { MapPin, Calendar, Building, Users, TrendingUp, Clock, CheckCircle, Eye, Heart, Bed } from 'lucide-react';
import { Release, Unit } from '@/types/releases';

interface ReleaseCardProps {
  release: Release;
  units?: Unit[];
  isLoading?: boolean;
}

export function ReleaseCard({ release, units, isLoading }: ReleaseCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
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

  // Calcular dados das unidades
  const unitsData = release.units || [];

  const prices = unitsData.map(unit => unit.price || 0).filter(price => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : (release.minUnitPrice || 0);
  const bedrooms = Array.from(new Set(unitsData.map(unit => unit.bedrooms || 0).filter(bed => bed > 0)));
  const areas = unitsData.map(unit => unit.privateArea || 0).filter(area => area > 0);
  const minArea = areas.length > 0 ? Math.min(...areas) : 0;
  const maxArea = areas.length > 0 ? Math.max(...areas) : 0;
  const availableUnits = unitsData.filter(unit => unit.status === 'Disponível').length;
  const statusInfo = getStatusInfo(release.status || 'Lançamento');
  const StatusIcon = statusInfo.icon;

  return (
    <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-accent/20">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <div className="relative w-full h-full group-hover:scale-110 transition-transform duration-700">
          <img
            src={release.images?.[0] || '/placeholder-property.jpg'}
            alt={release.title || 'Empreendimento'}
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
          <h3 className="text-2xl font-bold text-foreground mb-2 leading-tight">{release.title || 'Empreendimento'}</h3>
          <div className="flex items-center space-x-2 text-foreground/90">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">
              {release.address?.neighborhood || release.address?.city || 'Localização não informada'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Price Range */}
        {minPrice > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-xl border border-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-50"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">A partir de</div>
                <div className="text-2xl font-bold text-accent">
                  {formatPrice(minPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-card-foreground">{availableUnits}</div>
                <div className="text-xs text-muted-foreground">unidades disponíveis</div>
              </div>
            </div>
          </div>
        )}

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 mb-6 py-4 px-2 bg-accent/5 rounded-xl border border-accent/10">
          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-2 mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Bed className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-bold text-card-foreground">
              {bedrooms.length > 0 ? bedrooms.join(', ') + ' Quartos' : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-2 mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-bold text-card-foreground">
              {minArea > 0 && maxArea > 0 ? `${minArea} - ${maxArea}m²` : 'N/A'}
            </div>

          </div>
          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-2 mx-auto mb-2 w-10 h-10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div className="text-sm font-bold text-card-foreground">
              {release.createdAt ? formatDate(release.createdAt) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Features */}
        {release.features && release.features.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-card-foreground mb-3 uppercase tracking-wide">Principais Diferenciais</h4>
            <div className="flex flex-wrap gap-2">
              {release.features.slice(0, 3).map((feature: string) => (
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
        )}



        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link href={`/releases/${release.id}`}>
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-3 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Ver Detalhes
            </Button>
          </Link>
          <WhatsAppButton
            variant="outline"
            className="flex-1 border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105"
            message={`Olá! Tenho interesse no lançamento: ${release.title}. Gostaria de mais informações.`}
          >
            Tenho Interesse
          </WhatsAppButton>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
