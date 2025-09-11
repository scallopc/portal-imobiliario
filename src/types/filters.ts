export interface BaseFilters {
  neighborhood: string;
  priceRange: { min: number; max: number };
  bedrooms: number[];
}

export interface PropertyFilters extends BaseFilters {
  propertyType: string;
  bathrooms: number[];
  area: { min: number; max: number };
  parking: number[];
}

export interface ReleaseFilters extends BaseFilters {
  status: string;
  deliveryDate: { min: string; max: string };
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
}

export interface FilterConfig {
  showNeighborhood?: boolean;
  showPriceRange?: boolean;
  showBedrooms?: boolean;
  showPropertyType?: boolean;
  showBathrooms?: boolean;
  showArea?: boolean;
  showParking?: boolean;
  showStatus?: boolean;
  showDeliveryDate?: boolean;
  maxPrice?: number;
  maxArea?: number;
}
