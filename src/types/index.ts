export interface Property {
  id: string
  title: string
  description: string
  price: number
  type: 'casa' | 'apartamento' | 'terreno' | 'comercial'
  bedrooms?: number
  bathrooms?: number
  area: number
  address: {
    street: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  images: string[]
  features: string[]
  contact: {
    name: string
    phone: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface SearchFilters {
  query?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  city?: string
  neighborhood?: string
}
