import { adminDb } from './firebase-admin'
import { Property } from '@/types'

interface LinkData {
  id: string
  type: string
  updatedAt: Date
  url: string
  lastCrawled?: Date
  status?: 'pending' | 'processing' | 'completed' | 'error'
}

interface CrawledProperty {
  title: string
  description: string
  price?: number
  area?: number
  bedrooms?: number
  bathrooms?: number
  parking?: number
  address?: {
    street?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    country: string
    latitude?: number
    longitude?: number
  }
  type: 'apartment' | 'house' | 'commercial' | 'land'
  status: 'available' | 'sold' | 'rented' | 'construction'
  paymentMethods?: string[]
  features?: string[]
  images?: string[]
  sourceUrl: string
  sourceId: string
}

export class PropertyCrawler {
  private async fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private async extractLinksFromLinktree(html: string, baseUrl: string): Promise<string[]> {
    const links: string[] = []
    
    // Padrões para extrair links do Linktree
    const linkPatterns = [
      /<a[^>]*href="([^"]*)"[^>]*>/gi,
      /href="([^"]*)"[^>]*>/gi,
      /"url":"([^"]*)"/gi
    ]
    
    for (const pattern of linkPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1]
        if (url && this.isPropertyLink(url)) {
          // Converter URLs relativas para absolutas
          const absoluteUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href
          links.push(absoluteUrl)
        }
      }
    }
    
    // Remover duplicatas
    const uniqueLinks = Array.from(new Set(links))
    return uniqueLinks
  }

  private isPropertyLink(url: string): boolean {
    const propertyKeywords = [
      'imovel', 'imóvel', 'apartamento', 'casa', 'terreno', 'comercial',
      'venda', 'aluguel', 'alugar', 'comprar', 'financiamento',
      'quarto', 'suite', 'suíte', 'm²', 'metros'
    ]
    
    const lowerUrl = url.toLowerCase()
    return propertyKeywords.some(keyword => lowerUrl.includes(keyword))
  }

  private async extractFromHTML(html: string, url: string): Promise<Partial<CrawledProperty>> {
    // Usar regex e parsing básico para extrair informações
    const property: Partial<CrawledProperty> = {
      sourceUrl: url
    }

    // Extrair título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) {
      property.title = titleMatch[1].trim()
    }

    // Extrair descrição
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
    if (descMatch) {
      property.description = descMatch[1].trim()
    }

    // Extrair preço (padrões comuns)
    const pricePatterns = [
      /R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*mil/gi,
      /preço[:\s]*R\$\s*([\d.,]+)/gi,
      /valor[:\s]*R\$\s*([\d.,]+)/gi
    ]
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern)
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.')
        const price = parseFloat(priceStr)
        if (!isNaN(price)) {
          property.price = price
          break
        }
      }
    }

    // Extrair área
    const areaPatterns = [
      /(\d+)\s*m²/gi,
      /(\d+)\s*metros\s*quadrados/gi,
      /área[:\s]*(\d+)/gi
    ]
    
    for (const pattern of areaPatterns) {
      const match = html.match(pattern)
      if (match) {
        const area = parseInt(match[1])
        if (!isNaN(area)) {
          property.area = area
          break
        }
      }
    }

    // Extrair quartos
    const bedroomPatterns = [
      /(\d+)\s*quarto/gi,
      /(\d+)\s*suíte/gi,
      /quarto[:\s]*(\d+)/gi
    ]
    
    for (const pattern of bedroomPatterns) {
      const match = html.match(pattern)
      if (match) {
        const bedrooms = parseInt(match[1])
        if (!isNaN(bedrooms)) {
          property.bedrooms = bedrooms
          break
        }
      }
    }

    // Extrair banheiros
    const bathroomPatterns = [
      /(\d+)\s*banheiro/gi,
      /(\d+)\s*wc/gi,
      /banheiro[:\s]*(\d+)/gi
    ]
    
    for (const pattern of bathroomPatterns) {
      const match = html.match(pattern)
      if (match) {
        const bathrooms = parseInt(match[1])
        if (!isNaN(bathrooms)) {
          property.bathrooms = bathrooms
          break
        }
      }
    }

    // Determinar tipo de imóvel
    const typeKeywords = {
      apartment: ['apartamento', 'apto', 'flat', 'studio'],
      house: ['casa', 'sobrado', 'bangalô', 'mansão'],
      commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório'],
      land: ['terreno', 'lote', 'chácara', 'sítio']
    }

    const lowerHtml = html.toLowerCase()
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerHtml.includes(keyword))) {
        property.type = type as any
        break
      }
    }

    // Extrair endereço (padrões básicos)
    const addressPatterns = [
      /endereço[:\s]*([^<>\n]+)/gi,
      /localização[:\s]*([^<>\n]+)/gi,
      /rua[:\s]*([^<>\n]+)/gi,
      /avenida[:\s]*([^<>\n]+)/gi
    ]

    for (const pattern of addressPatterns) {
      const match = html.match(pattern)
      if (match) {
        const address = match[1].trim()
        if (address.length > 10) {
          property.address = {
            street: address,
            country: 'Brasil'
          }
          break
        }
      }
    }

    // Extrair métodos de pagamento
    const paymentKeywords = ['financiamento', 'entrada', 'parcelado', 'à vista', 'consórcio']
    const paymentMethods: string[] = []
    
    for (const keyword of paymentKeywords) {
      if (lowerHtml.includes(keyword)) {
        paymentMethods.push(keyword)
      }
    }
    
    if (paymentMethods.length > 0) {
      property.paymentMethods = paymentMethods
    }

    // Extrair características
    const featureKeywords = ['piscina', 'academia', 'playground', 'churrasqueira', 'elevador', 'portaria']
    const features: string[] = []
    
    for (const keyword of featureKeywords) {
      if (lowerHtml.includes(keyword)) {
        features.push(keyword)
      }
    }
    
    if (features.length > 0) {
      property.features = features
    }

    // Extrair imagens
    const imgMatches = html.match(/<img[^>]*src="([^"]+)"[^>]*>/gi)
    if (imgMatches) {
      const images: string[] = []
      for (const imgMatch of imgMatches) {
        const srcMatch = imgMatch.match(/src="([^"]+)"/)
        if (srcMatch) {
          const src = srcMatch[1]
          if (src.startsWith('http') && !src.includes('logo') && !src.includes('icon')) {
            images.push(src)
          }
        }
      }
      if (images.length > 0) {
        property.images = images.slice(0, 5) // Limitar a 5 imagens
      }
    }

    return property
  }

  private async crawlLinktree(linkData: LinkData): Promise<CrawledProperty[]> {
    try {
      console.log(`Crawling Linktree: ${linkData.url}`)
      
      const response = await this.fetchWithTimeout(linkData.url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      
      // Extrair links de propriedades do Linktree
      const propertyLinks = await this.extractLinksFromLinktree(html, linkData.url)
      
      console.log(`Encontrados ${propertyLinks.length} links de propriedades no Linktree`)
      
      const properties: CrawledProperty[] = []
      
      // Processar cada link de propriedade encontrado
      for (const propertyUrl of propertyLinks) {
        try {
          console.log(`Processando propriedade: ${propertyUrl}`)
          
          const propertyResponse = await this.fetchWithTimeout(propertyUrl)
          if (!propertyResponse.ok) {
            console.log(`Erro ao acessar ${propertyUrl}: ${propertyResponse.status}`)
            continue
          }
          
          const propertyHtml = await propertyResponse.text()
          const extractedData = await this.extractFromHTML(propertyHtml, propertyUrl)
          
          // Validar dados mínimos
          if (!extractedData.title) {
            console.log(`Título não encontrado para ${propertyUrl}`)
            continue
          }
          
          const property: CrawledProperty = {
            title: extractedData.title,
            description: extractedData.description || 'Descrição não disponível',
            price: extractedData.price,
            area: extractedData.area,
            bedrooms: extractedData.bedrooms,
            bathrooms: extractedData.bathrooms,
            parking: extractedData.parking,
            address: extractedData.address || { country: 'Brasil' },
            type: extractedData.type || 'apartment',
            status: 'available',
            paymentMethods: extractedData.paymentMethods,
            features: extractedData.features,
            images: extractedData.images,
            sourceUrl: propertyUrl,
            sourceId: linkData.id
          }
          
          properties.push(property)
          
          // Pequena pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (error) {
          console.error(`Erro ao processar propriedade ${propertyUrl}:`, error)
        }
      }
      
      return properties
      
    } catch (error) {
      console.error(`Erro ao crawlear Linktree ${linkData.url}:`, error)
      return []
    }
  }

  private async saveProperty(property: CrawledProperty): Promise<string> {
    const propertyData = {
      ...property,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      views: 0,
      favorites: 0
    }

    const docRef = await adminDb.collection('properties').add(propertyData)
    return docRef.id
  }

  private async updateLinkStatus(linkId: string, status: string, error?: string): Promise<void> {
    try {
      console.log(`Atualizando status do link ${linkId} para: ${status}`)
      
      const updateData: any = {
        lastCrawled: new Date(),
        status,
      }
      
      if (error) {
        updateData.error = error
        console.log(`Erro registrado: ${error}`)
      } else {
        updateData.error = null
      }
      
      await adminDb.collection('links').doc(linkId).update(updateData)
      console.log(`Status atualizado com sucesso para: ${status}`)
      
    } catch (updateError) {
      console.error(`Erro ao atualizar status do link ${linkId}:`, updateError)
      throw updateError
    }
  }

  public async runCrawler(): Promise<void> {
    console.log('Iniciando crawler de propriedades...')
    
    try {
      // Buscar links pendentes (todos os links da coleção)
      const linksSnapshot = await adminDb.collection('links')
        .limit(50) // Processar no máximo 50 por vez
        .get()

      if (linksSnapshot.empty) {
        console.log('Nenhum link encontrado na coleção')
        return
      }

      console.log(`Encontrados ${linksSnapshot.size} links para processar`)

      const links: LinkData[] = linksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LinkData))

      let successCount = 0
      let errorCount = 0
      let totalProperties = 0

      for (const link of links) {
        try {
          // Marcar como processando
          await this.updateLinkStatus(link.id, 'processing')

          // Crawlear o Linktree
          const properties = await this.crawlLinktree(link)
          
          if (properties.length > 0) {
            // Salvar cada propriedade encontrada
            for (const property of properties) {
              const propertyId = await this.saveProperty(property)
              console.log(`Propriedade salva: ${propertyId} - ${property.title}`)
              totalProperties++
            }
            
            // Marcar como completado
            await this.updateLinkStatus(link.id, 'completed')
            successCount++
          } else {
            // Marcar como erro se não encontrou propriedades
            await this.updateLinkStatus(link.id, 'error', 'Nenhuma propriedade encontrada')
            errorCount++
          }

        } catch (error) {
          console.error(`Erro ao processar link ${link.id}:`, error)
          await this.updateLinkStatus(link.id, 'error', error instanceof Error ? error.message : 'Erro desconhecido')
          errorCount++
        }

        // Pequena pausa entre Linktrees para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log(`Crawler concluído: ${successCount} Linktrees processados, ${errorCount} erros, ${totalProperties} propriedades salvas`)

    } catch (error) {
      console.error('Erro geral no crawler:', error)
    }
  }
}
