'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { SearchFilters } from '@/types'

interface PropertyFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
}

export default function PropertyFilters({ filters, onFiltersChange, onClearFilters }: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '')

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Barra de busca principal */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por título, bairro ou cidade..."
            value={filters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/80 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros expandidos */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Tipo de imóvel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
          </div>

          {/* Preço mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço mínimo</label>
                          <input
                type="number"
                placeholder="R$ 0"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
              />
          </div>

          {/* Preço máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço máximo</label>
                          <input
                type="number"
                placeholder="R$ 1.000.000"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
              />
          </div>

          {/* Quartos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartos</label>
            <select
              value={filters.bedrooms || ''}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">Qualquer</option>
              <option value="1">1+ quarto</option>
              <option value="2">2+ quartos</option>
              <option value="3">3+ quartos</option>
              <option value="4">4+ quartos</option>
            </select>
          </div>

          {/* Banheiros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banheiros</label>
            <select
              value={filters.bathrooms || ''}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">Qualquer</option>
              <option value="1">1+ banheiro</option>
              <option value="2">2+ banheiros</option>
              <option value="3">3+ banheiros</option>
            </select>
          </div>

          {/* Área mínima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área mínima (m²)</label>
            <input
              type="number"
              placeholder="50"
              value={filters.minArea || ''}
              onChange={(e) => handleFilterChange('minArea', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              placeholder="Digite a cidade"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Bairro */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
            <input
              type="text"
              placeholder="Digite o bairro"
              value={filters.neighborhood || ''}
              onChange={(e) => handleFilterChange('neighborhood', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  )
}
