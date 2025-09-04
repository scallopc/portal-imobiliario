import { adminDb } from './firebase-admin'
import { PropertyCrawler } from './crawler'
import { GoogleDriveCrawler } from './google-drive-crawler'

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
  documents?: string[]
  sourceUrl: string
  sourceId: string
}

export class HybridCrawler {
  private propertyCrawler: PropertyCrawler
  private googleDriveCrawler: GoogleDriveCrawler

  constructor() {
    this.propertyCrawler = new PropertyCrawler()
    this.googleDriveCrawler = new GoogleDriveCrawler()
  }

  private async fetchWithTimeout(url: string, timeout = 15000): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
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
    
    // Padrões melhorados para extrair links do Linktree
    const linkPatterns = [
      /<a[^>]*href="([^"]*)"[^>]*>/gi,
      /href="([^"]*)"[^>]*>/gi,
      /"url":"([^"]*)"/gi,
      /"href":"([^"]*)"/gi,
      /href='([^']*)'/gi,
      /<link[^>]*href="([^"]*)"[^>]*>/gi
    ]
    
    for (const pattern of linkPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1]
        if (url && this.isValidPropertyLink(url)) {
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

  private isValidPropertyLink(url: string): boolean {
    // Ignorar links internos do Linktree e outros serviços
    const ignorePatterns = [
      'linktr.ee/s/about',
      'linktr.ee/s/',
      'mailto:',
      'tel:',
      'whatsapp',
      'instagram.com',
      'facebook.com',
      'youtube.com',
      'twitter.com',
      'linkedin.com',
      'tiktok.com'
    ]
    
    const lowerUrl = url.toLowerCase()
    if (ignorePatterns.some(pattern => lowerUrl.includes(pattern))) {
      return false
    }
    
    // Verificar se é um link externo válido
    return url.startsWith('http') && !url.includes('linktr.ee')
  }

  private async extractFromHTML(html: string, url: string): Promise<Partial<CrawledProperty>> {
    const property: Partial<CrawledProperty> = {
      sourceUrl: url
    }

    // Extrair título com mais padrões
    const titlePatterns = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<h2[^>]*>([^<]+)<\/h2>/i,
      /class="[^"]*title[^"]*"[^>]*>([^<]+)</i,
      /id="[^"]*title[^"]*"[^>]*>([^<]+)</i
    ]
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern)
      if (match) {
        const title = match[1].trim()
        if (title.length > 3 && title.length < 200) {
          property.title = title
          break
        }
      }
    }

    // Extrair descrição com mais padrões
    const descPatterns = [
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</i
    ]
    
    for (const pattern of descPatterns) {
      const match = html.match(pattern)
      if (match) {
        const description = match[1].trim()
        if (description.length > 10 && description.length < 500) {
          property.description = description
          break
        }
      }
    }

    // Extrair preço com padrões mais avançados
    const pricePatterns = [
      /R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*mil/gi,
      /preço[:\s]*R\$\s*([\d.,]+)/gi,
      /valor[:\s]*R\$\s*([\d.,]+)/gi,
      /a partir de[:\s]*R\$\s*([\d.,]+)/gi,
      /desde[:\s]*R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*reais/gi,
      /R\$\s*([\d.,]+)\s*por m²/gi,
      /R\$\s*([\d.,]+)\s*por metro/gi,
      /([\d.,]+)\s*reais/gi,
      /([\d.,]+)\s*R\$/gi
    ]
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern)
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.')
        const price = parseFloat(priceStr)
        if (!isNaN(price) && price > 0) {
          property.price = price
          break
        }
      }
    }

    // Extrair área com padrões mais avançados
    const areaPatterns = [
      /(\d+)\s*m²/gi,
      /(\d+)\s*metros\s*quadrados/gi,
      /(\d+)\s*m2/gi,
      /área[:\s]*(\d+)/gi,
      /metragem[:\s]*(\d+)/gi,
      /tamanho[:\s]*(\d+)/gi,
      /(\d+)\s*metros/gi,
      /(\d+)\s*m/gi,
      /(\d+)\s*sqm/gi,
      /(\d+)\s*sq\s*m/gi
    ]
    
    for (const pattern of areaPatterns) {
      const match = html.match(pattern)
      if (match) {
        const area = parseInt(match[1])
        if (!isNaN(area) && area > 0 && area < 10000) {
          property.area = area
          break
        }
      }
    }

    // Extrair quartos com padrões mais avançados
    const bedroomPatterns = [
      /(\d+)\s*quarto/gi,
      /(\d+)\s*dormitório/gi,
      /(\d+)\s*suíte/gi,
      /quarto[:\s]*(\d+)/gi,
      /dormitório[:\s]*(\d+)/gi,
      /suíte[:\s]*(\d+)/gi,
      /(\d+)\s*bedroom/gi,
      /(\d+)\s*suite/gi
    ]
    
    for (const pattern of bedroomPatterns) {
      const match = html.match(pattern)
      if (match) {
        const bedrooms = parseInt(match[1])
        if (!isNaN(bedrooms) && bedrooms > 0 && bedrooms < 20) {
          property.bedrooms = bedrooms
          break
        }
      }
    }

    // Extrair banheiros com padrões mais avançados
    const bathroomPatterns = [
      /(\d+)\s*banheiro/gi,
      /(\d+)\s*wc/gi,
      /(\d+)\s*bathroom/gi,
      /banheiro[:\s]*(\d+)/gi,
      /wc[:\s]*(\d+)/gi,
      /bathroom[:\s]*(\d+)/gi
    ]
    
    for (const pattern of bathroomPatterns) {
      const match = html.match(pattern)
      if (match) {
        const bathrooms = parseInt(match[1])
        if (!isNaN(bathrooms) && bathrooms > 0 && bathrooms < 20) {
          property.bathrooms = bathrooms
          break
        }
      }
    }

    // Extrair vagas de estacionamento
    const parkingPatterns = [
      /(\d+)\s*vaga/gi,
      /(\d+)\s*garagem/gi,
      /(\d+)\s*parking/gi,
      /vaga[:\s]*(\d+)/gi,
      /garagem[:\s]*(\d+)/gi,
      /parking[:\s]*(\d+)/gi
    ]
    
    for (const pattern of parkingPatterns) {
      const match = html.match(pattern)
      if (match) {
        const parking = parseInt(match[1])
        if (!isNaN(parking) && parking >= 0 && parking < 20) {
          property.parking = parking
          break
        }
      }
    }

    // Determinar tipo de imóvel com mais precisão
    const typeKeywords = {
      apartment: ['apartamento', 'apto', 'flat', 'studio', 'residencial', 'cobertura'],
      house: ['casa', 'sobrado', 'bangalô', 'mansão', 'residência', 'vila'],
      commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório', 'office', 'loft'],
      land: ['terreno', 'lote', 'chácara', 'sítio', 'fazenda', 'área']
    }

    const lowerHtml = html.toLowerCase()
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerHtml.includes(keyword))) {
        property.type = type as any
        break
      }
    }

    // Extrair endereço com padrões mais avançados
    const addressPatterns = [
      /endereço[:\s]*([^<>\n]+)/gi,
      /localização[:\s]*([^<>\n]+)/gi,
      /rua[:\s]*([^<>\n]+)/gi,
      /avenida[:\s]*([^<>\n]+)/gi,
      /bairro[:\s]*([^<>\n]+)/gi,
      /cidade[:\s]*([^<>\n]+)/gi,
      /estado[:\s]*([^<>\n]+)/gi,
      /localizado[:\s]*em[:\s]*([^<>\n]+)/gi,
      /situado[:\s]*em[:\s]*([^<>\n]+)/gi
    ]

    for (const pattern of addressPatterns) {
      const match = html.match(pattern)
      if (match) {
        const address = match[1].trim()
        if (address.length > 10 && address.length < 200) {
          // Tentar extrair componentes do endereço
          const addressComponents = this.parseAddress(address)
          property.address = {
            ...addressComponents,
            country: 'Brasil'
          }
          break
        }
      }
    }

    // Extrair métodos de pagamento
    const paymentKeywords = ['financiamento', 'entrada', 'parcelado', 'à vista', 'consórcio', 'leasing', 'permuta']
    const paymentMethods: string[] = []
    
    for (const keyword of paymentKeywords) {
      if (lowerHtml.includes(keyword)) {
        paymentMethods.push(keyword)
      }
    }
    
    if (paymentMethods.length > 0) {
      property.paymentMethods = paymentMethods
    }

    // Extrair características com mais opções
    const featureKeywords = [
      'piscina', 'academia', 'playground', 'churrasqueira', 'elevador', 'portaria',
      'ar condicionado', 'sacada', 'jardim', 'suite', 'mobiliado', 'novo',
      'residencial', 'lançamento', 'pronto para morar', 'em construção',
      'segurança 24h', 'porteiro', 'área de lazer', 'quadra', 'sala de festas'
    ]
    const features: string[] = []
    
    for (const keyword of featureKeywords) {
      if (lowerHtml.includes(keyword)) {
        features.push(keyword)
      }
    }
    
    if (features.length > 0) {
      property.features = features
    }

    // Extrair imagens usando o método melhorado
    property.images = await this.extractImagesFromHTML(html, url)

    return property
  }

  private async extractImagesFromHTML(html: string, baseUrl: string): Promise<string[]> {
    const images: string[] = []
    
    // Padrões para extrair imagens
    const imgPatterns = [
      /<img[^>]*src="([^"]+)"[^>]*>/gi,
      /<img[^>]*src='([^']+)'[^>]*>/gi,
      /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /background:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"/gi,
      /src='([^']*\.(?:jpg|jpeg|png|gif|webp))'/gi
    ]
    
    for (const pattern of imgPatterns) {
      let match
      while ((match = pattern.exec(html)) !== null) {
        const imageUrl = match[1]
        if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.includes('logo') && !imageUrl.includes('icon')) {
          try {
            const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, baseUrl).href
            if (this.isValidImageUrl(absoluteUrl)) {
              images.push(absoluteUrl)
            }
          } catch (error) {
            console.log(`URL de imagem inválida: ${imageUrl}`)
          }
        }
      }
    }
    
    // Remover duplicatas e limitar a 10 imagens
    return Array.from(new Set(images)).slice(0, 10)
  }

  private isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const lowerUrl = url.toLowerCase()
    
    // Verificar se tem extensão de imagem
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return true
    }
    
    // Verificar se parece ser uma URL de imagem (sem parâmetros estranhos)
    if (lowerUrl.includes('image') || lowerUrl.includes('img') || lowerUrl.includes('photo')) {
      return true
    }
    
    return false
  }

  private parseAddress(address: string): any {
    const addressObj: any = {}
    
    // Padrões para extrair cidade e estado
    const cityStatePatterns = [
      /([^,]+),\s*([A-Z]{2})/i,
      /([^,]+)\s*-\s*([A-Z]{2})/i,
      /em\s+([^,]+),\s*([A-Z]{2})/i
    ]
    
    for (const pattern of cityStatePatterns) {
      const match = address.match(pattern)
      if (match) {
        addressObj.city = match[1].trim()
        addressObj.state = match[2].trim()
        break
      }
    }
    
    // Se não conseguiu extrair cidade/estado, usar o endereço completo
    if (!addressObj.city) {
      addressObj.street = address
    }
    
    return addressObj
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
      
      // Separar links normais de links do Google Drive
      const normalLinks: string[] = []
      const googleDriveLinks: string[] = []
      
      for (const url of propertyLinks) {
        if (this.googleDriveCrawler.isGoogleDriveUrl(url)) {
          googleDriveLinks.push(url)
        } else {
          normalLinks.push(url)
        }
      }
      
      console.log(`Links normais: ${normalLinks.length}, Links Google Drive: ${googleDriveLinks.length}`)
      
      // Processar links normais
      for (const propertyUrl of normalLinks) {
        try {
          console.log(`Processando propriedade normal: ${propertyUrl}`)
          
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
            documents: [],
            sourceUrl: propertyUrl,
            sourceId: linkData.id
          }
          
          properties.push(property)
          
          // Pequena pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          console.error(`Erro ao processar propriedade ${propertyUrl}:`, error)
        }
      }
      
      // Processar links do Google Drive
      if (googleDriveLinks.length > 0) {
        try {
          console.log(`Processando ${googleDriveLinks.length} arquivos do Google Drive...`)
          
          const googleDriveData = await this.googleDriveCrawler.processGoogleDriveLinks(
            googleDriveLinks.map(url => ({ url, id: linkData.id }))
          )
          
          // Converter dados do Google Drive para o formato padrão
          for (const docData of googleDriveData) {
            const property: CrawledProperty = {
              title: docData.title,
              description: docData.description || 'Documento do Google Drive',
              price: docData.price,
              area: docData.area,
              bedrooms: docData.bedrooms,
              bathrooms: docData.bathrooms,
              parking: docData.parking,
              address: docData.address || { country: 'Brasil' },
              type: docData.type || 'apartment',
              status: docData.status || 'available',
              paymentMethods: [],
              features: docData.features || [],
              images: docData.images || [],
              documents: docData.documents || [],
              sourceUrl: docData.sourceUrl,
              sourceId: docData.sourceId
            }
            
            properties.push(property)
          }
          
        } catch (error) {
          console.error(`Erro ao processar arquivos do Google Drive:`, error)
        }
      }
      
      return properties
      
    } catch (error) {
      console.error(`Erro ao crawlear Linktree ${linkData.url}:`, error)
      return []
    }
  }

  private async saveProperty(property: CrawledProperty): Promise<string> {
    // Remover campos undefined antes de salvar
    const cleanProperty: any = {}
    for (const [key, value] of Object.entries(property)) {
      if (value !== undefined && value !== null) {
        cleanProperty[key] = value
      }
    }

    const propertyData = {
      // Campos básicos com valores padrão
      title: cleanProperty.title || 'Imóvel sem título',
      description: cleanProperty.description || 'Descrição não disponível',
      price: cleanProperty.price || null,
      area: cleanProperty.area || null,
      bedrooms: cleanProperty.bedrooms || null,
      bathrooms: cleanProperty.bathrooms || null,
      parking: cleanProperty.parking || null,
      type: cleanProperty.type || 'apartment',
      status: cleanProperty.status || 'available',
      features: cleanProperty.features || [],
      images: cleanProperty.images || [],
      sourceUrl: cleanProperty.sourceUrl || '',
      sourceId: cleanProperty.sourceId || '',
      
      // Metadados
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      views: 0,
      favorites: 0,
      
      // Campos para processamento
      needsProcessing: true,
      processingStatus: 'pending',
      rawData: cleanProperty
    }

    try {
      const docRef = await adminDb.collection('properties_raw').add(propertyData)
      console.log(`Propriedade salva: ${docRef.id} - ${propertyData.title}`)
      return docRef.id
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error)
      throw error
    }
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
    console.log('Iniciando crawler híbrido de propriedades...')
    
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
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      console.log(`Crawler híbrido concluído: ${successCount} Linktrees processados, ${errorCount} erros, ${totalProperties} propriedades salvas`)

    } catch (error) {
      console.error('Erro geral no crawler híbrido:', error)
    }
  }
}
