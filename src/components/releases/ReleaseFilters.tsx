'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Building, Clock, CheckCircle } from 'lucide-react';

interface SearchFilters {
  neighborhood: string;
  status: string;
  priceRange: { min: number; max: number };
  bedrooms: number[];
}

interface ReleaseFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const neighborhoods = [
  'Barra da Tijuca',
  'Recreio dos Bandeirantes',
  'Joá',
  'Itanhangá',
  'Camorim',
  'Vargem Grande',
  'Vargem Pequena',
  'Grumari',
  'Icaraí',
  'Santa Rosa',
  'Fátima',
  'São Francisco',
  'Charitas',
  'Cafubá',
  'Piratininga',
  'Camboinhas',
  'Itaipu',
  'Itacoatiara'
];

const statusOptions = [
  { value: 'na_planta', label: 'Na Planta', icon: Building },
  { value: 'em_construcao', label: 'Em Construção', icon: Clock },
  { value: 'recem_entregue', label: 'Recém Entregue', icon: CheckCircle }
];

export function ReleaseFilters({ filters, onFiltersChange }: ReleaseFiltersProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleNeighborhoodChange = (value: string) => {
    onFiltersChange({
      ...filters,
      neighborhood: value === 'all' ? '' : value
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? '' : value
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: { min: values[0], max: values[1] }
    });
  };

  const handleBedroomsToggle = (bedrooms: number) => {
    const newBedrooms = filters.bedrooms.includes(bedrooms)
      ? filters.bedrooms.filter(b => b !== bedrooms)
      : [...filters.bedrooms, bedrooms];
    
    onFiltersChange({
      ...filters,
      bedrooms: newBedrooms
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      neighborhood: '',
      status: '',
      priceRange: { min: 0, max: 2000000 },
      bedrooms: []
    });
  };

  const hasActiveFilters = filters.neighborhood || filters.status || filters.bedrooms.length > 0 || 
    filters.priceRange.min > 0 || filters.priceRange.max < 2000000;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-accent/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">Filtros de Busca</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Neighborhood Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bairro</label>
          <Select value={filters.neighborhood || 'all'} onValueChange={handleNeighborhoodChange}>
            <SelectTrigger className="bg-background/50 border-accent/20">
              <SelectValue placeholder="Todos os bairros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {neighborhoods.map((neighborhood) => (
                <SelectItem key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Status do Empreendimento</label>
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-background/50 border-accent/20">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Faixa de Preço</label>
          <div className="px-3 py-2 bg-background/50 border border-accent/20 rounded-md">
            <Slider
              value={[filters.priceRange.min, filters.priceRange.max]}
              onValueChange={handlePriceRangeChange}
              max={2000000}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatPrice(filters.priceRange.min)}</span>
              <span>{formatPrice(filters.priceRange.max)}</span>
            </div>
          </div>
        </div>

        {/* Bedrooms Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quartos</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((bedrooms) => (
              <Button
                key={bedrooms}
                variant={filters.bedrooms.includes(bedrooms) ? "default" : "outline"}
                size="sm"
                onClick={() => handleBedroomsToggle(bedrooms)}
                className={`
                  ${filters.bedrooms.includes(bedrooms) 
                    ? 'bg-accent text-accent-foreground' 
                    : 'border-accent/20 text-foreground hover:bg-accent/10'
                  }
                `}
              >
                {bedrooms}+ qts
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-accent/20">
          <div className="flex flex-wrap gap-2">
            {filters.neighborhood && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {filters.neighborhood}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleNeighborhoodChange('all')}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {statusOptions.find(s => s.value === filters.status)?.label}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleStatusChange('all')}
                />
              </Badge>
            )}
            {filters.bedrooms.map((bedrooms) => (
              <Badge key={bedrooms} variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {bedrooms}+ quartos
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleBedroomsToggle(bedrooms)}
                />
              </Badge>
            ))}
            {(filters.priceRange.min > 0 || filters.priceRange.max < 2000000) && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handlePriceRangeChange([0, 2000000])}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
