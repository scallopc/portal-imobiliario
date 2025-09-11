'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Building, Clock, CheckCircle, Home, Car, Bath, Square } from 'lucide-react';
import { BaseFilters, PropertyFilters as PropertyFiltersType, ReleaseFilters, FilterConfig, FilterOption } from '@/types/filters';

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

const propertyTypes: FilterOption[] = [
  { value: 'apartamento', label: 'Apartamento', icon: Building },
  { value: 'casa', label: 'Casa', icon: Home },
  { value: 'cobertura', label: 'Cobertura', icon: Building },
  { value: 'studio', label: 'Studio', icon: Building }
];

const statusOptions: FilterOption[] = [
  { value: 'na_planta', label: 'Na Planta', icon: Building },
  { value: 'em_construcao', label: 'Em Construção', icon: Clock },
  { value: 'recem_entregue', label: 'Recém Entregue', icon: CheckCircle }
];

interface PropertyFiltersProps {
  filters: BaseFilters | PropertyFiltersType | ReleaseFilters;
  onFiltersChange: (filters: any) => void;
  config: FilterConfig;
  title?: string;
}

export function PropertyFilters({ 
  filters, 
  onFiltersChange, 
  config,
  title = "Filtros de Busca"
}: PropertyFiltersProps) {
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

  const handlePropertyTypeChange = (value: string) => {
    if ('propertyType' in filters) {
      onFiltersChange({
        ...filters,
        propertyType: value === 'all' ? '' : value
      });
    }
  };

  const handleStatusChange = (value: string) => {
    if ('status' in filters) {
      onFiltersChange({
        ...filters,
        status: value === 'all' ? '' : value
      });
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: { min: values[0], max: values[1] }
    });
  };

  const handleAreaRangeChange = (values: number[]) => {
    if ('area' in filters) {
      onFiltersChange({
        ...filters,
        area: { min: values[0], max: values[1] }
      });
    }
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

  const handleBathroomsToggle = (bathrooms: number) => {
    if ('bathrooms' in filters) {
      const newBathrooms = filters.bathrooms.includes(bathrooms)
        ? filters.bathrooms.filter(b => b !== bathrooms)
        : [...filters.bathrooms, bathrooms];
      
      onFiltersChange({
        ...filters,
        bathrooms: newBathrooms
      });
    }
  };

  const handleParkingToggle = (parking: number) => {
    if ('parking' in filters) {
      const newParking = filters.parking.includes(parking)
        ? filters.parking.filter(p => p !== parking)
        : [...filters.parking, parking];
      
      onFiltersChange({
        ...filters,
        parking: newParking
      });
    }
  };

  const clearFilters = () => {
    const baseFilters = {
      neighborhood: '',
      priceRange: { min: 0, max: config.maxPrice || 2000000 },
      bedrooms: []
    };

    if ('propertyType' in filters) {
      onFiltersChange({
        ...baseFilters,
        propertyType: '',
        bathrooms: [],
        area: { min: 0, max: config.maxArea || 500 },
        parking: []
      });
    } else if ('status' in filters) {
      onFiltersChange({
        ...baseFilters,
        status: '',
        deliveryDate: { min: '', max: '' }
      });
    } else {
      onFiltersChange(baseFilters);
    }
  };

  const hasActiveFilters = () => {
    if (filters.neighborhood) return true;
    if (filters.bedrooms.length > 0) return true;
    if (filters.priceRange.min > 0 || filters.priceRange.max < (config.maxPrice || 2000000)) return true;
    
    if ('propertyType' in filters) {
      if (filters.propertyType) return true;
      if (filters.bathrooms?.length > 0) return true;
      if (filters.parking?.length > 0) return true;
      if (filters.area && (filters.area.min > 0 || filters.area.max < (config.maxArea || 500))) return true;
    }
    
    if ('status' in filters) {
      if (filters.status) return true;
    }
    
    return false;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.neighborhood) count++;
    if (filters.bedrooms.length > 0) count += filters.bedrooms.length;
    if (filters.priceRange.min > 0 || filters.priceRange.max < (config.maxPrice || 2000000)) count++;
    
    if ('propertyType' in filters) {
      if (filters.propertyType) count++;
      if (filters.bathrooms?.length > 0) count += filters.bathrooms.length;
      if (filters.parking?.length > 0) count += filters.parking.length;
      if (filters.area && (filters.area.min > 0 || filters.area.max < (config.maxArea || 500))) count++;
    }
    
    if ('status' in filters && filters.status) count++;
    
    return count;
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-accent/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {hasActiveFilters() && (
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {getActiveFiltersCount()} filtros ativos
            </Badge>
          )}
        </div>
        {hasActiveFilters() && (
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
        {config.showNeighborhood && (
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
        )}

        {/* Property Type Filter */}
        {config.showPropertyType && 'propertyType' in filters && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de Imóvel</label>
            <Select value={filters.propertyType || 'all'} onValueChange={handlePropertyTypeChange}>
              <SelectTrigger className="bg-background/50 border-accent/20">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {propertyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter */}
        {config.showStatus && 'status' in filters && (
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
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range Filter */}
        {config.showPriceRange && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Faixa de Preço</label>
            <div className="px-3 py-2 bg-background/50 border border-accent/20 rounded-md">
              <Slider
                value={[filters.priceRange.min, filters.priceRange.max]}
                onValueChange={handlePriceRangeChange}
                max={config.maxPrice || 2000000}
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
        )}

        {/* Area Range Filter */}
        {config.showArea && 'area' in filters && filters.area && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Área (m²)</label>
            <div className="px-3 py-2 bg-background/50 border border-accent/20 rounded-md">
              <Slider
                value={[filters.area.min, filters.area.max]}
                onValueChange={handleAreaRangeChange}
                max={config.maxArea || 500}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{filters.area.min}m²</span>
                <span>{filters.area.max}m²</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Bedrooms Filter */}
        {config.showBedrooms && (
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
        )}

        {/* Bathrooms Filter */}
        {config.showBathrooms && 'bathrooms' in filters && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Banheiros</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((bathrooms) => (
                <Button
                  key={bathrooms}
                  variant={filters.bathrooms?.includes(bathrooms) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBathroomsToggle(bathrooms)}
                  className={`
                    ${filters.bathrooms?.includes(bathrooms) 
                      ? 'bg-accent text-accent-foreground' 
                      : 'border-accent/20 text-foreground hover:bg-accent/10'
                    }
                  `}
                >
                  <Bath className="w-3 h-3 mr-1" />
                  {bathrooms}+
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Parking Filter */}
        {config.showParking && 'parking' in filters && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Vagas</label>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4].map((parking) => (
                <Button
                  key={parking}
                  variant={filters.parking?.includes(parking) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleParkingToggle(parking)}
                  className={`
                    ${filters.parking?.includes(parking) 
                      ? 'bg-accent text-accent-foreground' 
                      : 'border-accent/20 text-foreground hover:bg-accent/10'
                    }
                  `}
                >
                  <Car className="w-3 h-3 mr-1" />
                  {parking === 0 ? 'Sem vaga' : `${parking}+`}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
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
            
            {'propertyType' in filters && filters.propertyType && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {propertyTypes.find(t => t.value === filters.propertyType)?.label}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handlePropertyTypeChange('all')}
                />
              </Badge>
            )}
            
            {'status' in filters && filters.status && (
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
            
            {'bathrooms' in filters && filters.bathrooms?.map((bathrooms) => (
              <Badge key={`bath-${bathrooms}`} variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {bathrooms}+ banheiros
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleBathroomsToggle(bathrooms)}
                />
              </Badge>
            ))}
            
            {'parking' in filters && filters.parking?.map((parking) => (
              <Badge key={`park-${parking}`} variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {parking === 0 ? 'Sem vaga' : `${parking}+ vagas`}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleParkingToggle(parking)}
                />
              </Badge>
            ))}
            
            {(filters.priceRange.min > 0 || filters.priceRange.max < (config.maxPrice || 2000000)) && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handlePriceRangeChange([0, config.maxPrice || 2000000])}
                />
              </Badge>
            )}
            
            {'area' in filters && filters.area && (filters.area.min > 0 || filters.area.max < (config.maxArea || 500)) && (
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {filters.area.min}m² - {filters.area.max}m²
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => handleAreaRangeChange([0, config.maxArea || 500])}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
