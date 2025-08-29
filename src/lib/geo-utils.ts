import { NextRequest } from 'next/server'

export interface GeoLocation {
  ip: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  neighborhood?: string
  zipCode?: string
}

export interface ClientInfo {
  name?: string
  phone?: string
  email?: string
  location: GeoLocation
  interests: string[]
  lastInteraction: Date
  // Preferências mencionadas pelo usuário
  locationHints?: {
    city?: string
    state?: string
    neighborhood?: string
    zipCode?: string
  }
}

// Função para obter IP real do cliente
export function getClientIP(request: NextRequest): string {
  // Tentar diferentes headers para obter o IP real
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  // Fallback para IP local
  return '127.0.0.1'
}

function isPrivateOrReservedIP(ip: string): boolean {
  if (!ip) return true
  // Remover IPv6 prefixo se vier no formato ::ffff:127.0.0.1
  const normalized = ip.startsWith('::ffff:') ? ip.replace('::ffff:', '') : ip
  if (normalized === '127.0.0.1' || normalized === '::1') return true
  // Faixas privadas IPv4
  if (/^10\./.test(normalized)) return true
  if (/^192\.168\./.test(normalized)) return true
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(normalized)) return true
  // Link-local
  if (/^169\.254\./.test(normalized)) return true
  // IPv6 Unique Local Addresses (fc00::/7)
  if (/^(fc|fd)/i.test(normalized)) return true
  // Reservados ou vazios
  return false
}

// Função para obter geolocalização baseada no IP
export async function getGeoLocation(ip: string): Promise<GeoLocation> {
  try {
    if (isPrivateOrReservedIP(ip)) {
      console.warn('[geo] IP privado/reservado detectado, usando fallback de localização')
      return {
        ip,
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        latitude: -23.5505,
        longitude: -46.6333,
        zipCode: '',
        neighborhood: ''
      }
    }

    // Usar serviço gratuito de geolocalização
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`)
    
    if (!response.ok) {
      throw new Error('Falha ao obter geolocalização')
    }
    
    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        ip: data.query,
        city: data.city || '',
        state: data.regionName || '',
        country: data.country || 'Brasil',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        zipCode: data.zip || '',
        neighborhood: '' // Será preenchido posteriormente se necessário
      }
    }
    
    throw new Error(data.message || 'Falha na geolocalização')
  } catch (error) {
    console.warn('Erro ao obter geolocalização, aplicando fallback:', error)
    
    // Retornar localização padrão (São Paulo)
    return {
      ip,
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333,
      zipCode: '',
      neighborhood: ''
    }
  }
}

// Função para calcular distância entre duas coordenadas (fórmula de Haversine)
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Função para encontrar imóveis próximos
export function findNearbyProperties(
  properties: any[], 
  userLat: number, 
  userLon: number, 
  maxDistance: number = 50 // 50km por padrão
): any[] {
  return properties
    .filter(property => {
      if (!property.address?.latitude || !property.address?.longitude) {
        return false
      }
      
      const distance = calculateDistance(
        userLat,
        userLon,
        property.address.latitude,
        property.address.longitude
      )
      
      return distance <= maxDistance
    })
    .sort((a, b) => {
      const distanceA = calculateDistance(
        userLat,
        userLon,
        a.address.latitude,
        a.address.longitude
      )
      const distanceB = calculateDistance(
        userLat,
        userLon,
        b.address.latitude,
        b.address.longitude
      )
      return distanceA - distanceB
    })
}

// Função para extrair informações do cliente da conversa
export function extractClientInfo(messages: any[]): Partial<ClientInfo> {
  const clientInfo: Partial<ClientInfo> = {
    interests: [],
    lastInteraction: new Date(),
    locationHints: {}
  }
  
  const allText = messages.map(m => m.content).join(' ').toLowerCase()
  
  // Extrair nome (padrões comuns)
  const namePatterns = [
    /me chamo\s+([a-zA-ZÀ-ÿ\s]+)/i,
    /sou\s+([a-zA-ZÀ-ÿ\s]+)/i,
    /nome\s+(?:é|e)\s+([a-zA-ZÀ-ÿ\s]+)/i,
    /chamo\s+([a-zA-ZÀ-ÿ\s]+)/i
  ]
  
  for (const pattern of namePatterns) {
    const match = allText.match(pattern)
    if (match && match[1]) {
      clientInfo.name = match[1].trim()
      break
    }
  }
  
  // Extrair telefone
  const phonePatterns = [
    /(\d{2}\s?\d{4,5}\s?\d{4})/g,
    /(\d{2}\s?\d{8,9})/g,
    /\((\d{2})\)\s?(\d{4,5})\s?(\d{4})/g
  ]
  
  for (const pattern of phonePatterns) {
    const match = allText.match(pattern)
    if (match) {
      clientInfo.phone = match[0].replace(/\s/g, '')
      break
    }
  }
  
  // Extrair email
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const emailMatch = allText.match(emailPattern)
  if (emailMatch) {
    clientInfo.email = emailMatch[0]
  }
  
  // Extrair interesses
  const interestKeywords = [
    'casa', 'apartamento', 'terreno', 'comercial',
    'alugar', 'comprar', 'investir', 'morar',
    'quarto', 'banheiro', 'área', 'localização'
  ]
  
  clientInfo.interests = interestKeywords.filter(keyword => 
    allText.includes(keyword)
  )

  // Extrair cidade/bairro/estado a partir de padrões simples em PT-BR
  // Exemplos: "em São Paulo", "na Vila Mariana", "em SP", "no RJ"
  const cityPattern = /\b(?:em|de|da|do|na|no)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\.|,|\?|!|$)/i
  const stateSiglaPattern = /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i
  const bairroPattern = /\b(?:bairro|na|no)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\.|,|\?|!|$)/i

  const cityMatch = allText.match(cityPattern)
  if (cityMatch && cityMatch[1]) {
    const city = cityMatch[1].trim()
    if (city.length >= 3) {
      clientInfo.locationHints = clientInfo.locationHints || {}
      clientInfo.locationHints.city = city
    }
  }

  const stateMatch = allText.match(stateSiglaPattern)
  if (stateMatch && stateMatch[1]) {
    clientInfo.locationHints = clientInfo.locationHints || {}
    clientInfo.locationHints.state = stateMatch[1].toUpperCase()
  }

  const bairroMatch = allText.match(bairroPattern)
  if (bairroMatch && bairroMatch[1]) {
    const nb = bairroMatch[1].trim()
    if (nb.length >= 3) {
      clientInfo.locationHints = clientInfo.locationHints || {}
      clientInfo.locationHints.neighborhood = nb
    }
  }
  
  return clientInfo
}
