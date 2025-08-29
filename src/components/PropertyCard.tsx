import { Property } from '@/types'
import { MapPin, Bed, Bath, Square, Phone, Mail } from 'lucide-react'
import Image from 'next/image'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={property.images[0] || '/placeholder-property.jpg'}
          alt={property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded text-sm font-semibold">
          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {property.address.neighborhood}, {property.address.city}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-gray-600 mb-3">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.area}m²</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-accent">
            {formatPrice(property.price)}
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:text-accent hover:bg-accent/10 rounded">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-accent hover:bg-accent/10 rounded">
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
