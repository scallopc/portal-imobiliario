import { adminDb } from './firebase-admin'

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink?: string
  size?: string
  createdTime: string
  modifiedTime: string
}

interface ExtractedDocumentData {
  title: string
  description?: string
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
  }
  type: 'apartment' | 'house' | 'commercial' | 'land'
  status: 'available' | 'sold' | 'rented' | 'construction'
  features?: string[]
  images?: string[]
  documents?: string[]
  sourceUrl: string
  sourceId: string
}

export class GoogleDriveCrawler {
  public isGoogleDriveUrl(url: string): boolean {
    return url.includes('drive.google.com') || url.includes('docs.google.com')
  }

  private async fetchWithTimeout(url: string, timeout = 20000): Promise<Response> {
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

  private detectFileType(url: string, html: string): 'pdf' | 'google-doc' | 'google-sheet' | 'google-slide' | 'unknown' {
    const lowerUrl = url.toLowerCase()
    const lowerHtml = html.toLowerCase()
    
    if (lowerUrl.includes('/pdf') || lowerUrl.includes('pdf') || lowerHtml.includes('pdf') || lowerHtml.includes('application/pdf')) {
      return 'pdf'
    }
    
    if (lowerUrl.includes('/document') || lowerUrl.includes('docs.google.com/document') || lowerHtml.includes('google docs')) {
      return 'google-doc'
    }
    
    if (lowerUrl.includes('/spreadsheets') || lowerUrl.includes('sheets.google.com') || lowerHtml.includes('google sheets')) {
      return 'google-sheet'
    }
    
    if (lowerUrl.includes('/presentation') || lowerUrl.includes('slides.google.com') || lowerHtml.includes('google slides')) {
      return 'google-slide'
    }
    
    return 'unknown'
  }

  private async extractFromGoogleDrive(url: string): Promise<Partial<ExtractedDocumentData>> {
    try {
      console.log(`Processando arquivo do Google Drive: ${url}`)
      
      const response = await this.fetchWithTimeout(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const html = await response.text()
      const fileType = this.detectFileType(url, html)
      
      console.log(`Tipo de arquivo detectado: ${fileType}`)
      
      // Extrair informações do arquivo do Google Drive
      const data: Partial<ExtractedDocumentData> = {
        sourceUrl: url
      }

      // Extrair título do arquivo
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) {
        data.title = titleMatch[1].trim()
        console.log(`Título extraído: ${data.title}`)
      }

      // Extrair descrição
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i)
      if (descMatch) {
        data.description = descMatch[1].trim()
      }

      // Processar baseado no tipo de arquivo
      if (fileType === 'pdf') {
        await this.extractFromPDF(url, html, data)
      } else if (fileType === 'google-doc') {
        await this.extractFromGoogleDoc(url, html, data)
      } else if (fileType === 'google-sheet') {
        await this.extractFromGoogleSheet(url, html, data)
      } else {
        // Fallback para extração genérica
        await this.extractGenericData(html, data)
      }

      // Extrair imagens do documento
      data.images = await this.extractImagesFromDocument(html, url)

      // Adicionar o próprio documento como documento disponível
      data.documents = [url]

      console.log(`Dados extraídos:`, {
        title: data.title,
        price: data.price,
        area: data.area,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        type: data.type,
        status: data.status
      })

      return data

    } catch (error) {
      console.error(`Erro ao processar arquivo do Google Drive ${url}:`, error)
      return { sourceUrl: url }
    }
  }

  private async extractFromPDF(url: string, html: string, data: Partial<ExtractedDocumentData>): Promise<void> {
    console.log('Processando PDF...')
    
    // Tentar extrair texto do PDF através da visualização do Google Drive
    const textContent = this.extractTextFromHTML(html)
    
    if (textContent) {
      console.log(`Texto extraído do PDF (${textContent.length} caracteres)`)
      
      // Primeiro, tentar extrair dados de tabelas estruturadas
      const tableData = this.extractTableData(textContent)
      if (tableData.length > 0) {
        console.log(`Encontradas ${tableData.length} unidades na tabela`)
        // Usar dados da primeira unidade disponível como dados principais
        const firstUnit = tableData.find(unit => unit.status !== 'fora de venda') || tableData[0]
        if (firstUnit) {
          data.price = firstUnit.price
          data.area = firstUnit.area
          data.bedrooms = firstUnit.bedrooms
          data.bathrooms = firstUnit.bathrooms
          data.parking = firstUnit.parking
          data.type = firstUnit.type
          data.status = firstUnit.status
          data.features = firstUnit.features
          console.log(`Dados da tabela aplicados: ${JSON.stringify(firstUnit)}`)
        }
      }
      
      // Se não encontrou dados na tabela, usar extração tradicional
      if (!data.price || !data.area) {
        // Extrair preços com padrões específicos para tabelas de vendas
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
          /([\d.,]+)\s*R\$/gi,
          /preço[:\s]*([\d.,]+)/gi,
          /valor[:\s]*([\d.,]+)/gi,
          /VALOR[:\s]*R\$\s*([\d.,]+)/gi,
          /VALOR[:\s]*([\d.,]+)/gi
        ]
      
      for (const pattern of pricePatterns) {
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const priceStr = match[1].replace(/\./g, '').replace(',', '.')
          const price = parseFloat(priceStr)
          if (!isNaN(price) && price > 0 && price < 10000000) { // Limite de 10 milhões
            data.price = price
            console.log(`Preço extraído: R$ ${price}`)
            break
          }
        }
        if (data.price) break
      }

      // Extrair área com padrões específicos para tabelas de vendas
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
        /(\d+)\s*sq\s*m/gi,
        /(\d+)\s*metros²/gi,
        /M2[:\s]*(\d+)/gi,
        /M²[:\s]*(\d+)/gi
      ]
      
      for (const pattern of areaPatterns) {
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const area = parseInt(match[1])
          if (!isNaN(area) && area > 0 && area < 10000) {
            data.area = area
            console.log(`Área extraída: ${area} m²`)
            break
          }
        }
        if (data.area) break
      }

      // Extrair quartos com padrões específicos para tabelas de vendas
      const bedroomPatterns = [
        /(\d+)\s*quarto/gi,
        /(\d+)\s*dormitório/gi,
        /(\d+)\s*suíte/gi,
        /quarto[:\s]*(\d+)/gi,
        /dormitório[:\s]*(\d+)/gi,
        /suíte[:\s]*(\d+)/gi,
        /(\d+)\s*bedroom/gi,
        /(\d+)\s*suite/gi,
        /TIPOLOGIA[:\s]*([^,\n]+)/gi,
        /tipologia[:\s]*([^,\n]+)/gi
      ]
      
      for (const pattern of bedroomPatterns) {
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const text = match[1]?.toLowerCase() || ''
          if (text.includes('quarto') || text.includes('dormitório') || text.includes('suite')) {
            // Extrair número de quartos do texto da tipologia
            const numMatch = text.match(/(\d+)/)
            if (numMatch) {
              const bedrooms = parseInt(numMatch[1])
              if (!isNaN(bedrooms) && bedrooms > 0 && bedrooms < 20) {
                data.bedrooms = bedrooms
                console.log(`Quartos extraídos: ${bedrooms}`)
                break
              }
            }
          }
        }
        if (data.bedrooms) break
      }

      // Extrair banheiros
      const bathroomPatterns = [
        /(\d+)\s*banheiro/gi,
        /(\d+)\s*wc/gi,
        /(\d+)\s*bathroom/gi,
        /banheiro[:\s]*(\d+)/gi,
        /wc[:\s]*(\d+)/gi,
        /bathroom[:\s]*(\d+)/gi
      ]
      
      for (const pattern of bathroomPatterns) {
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const bathrooms = parseInt(match[1])
          if (!isNaN(bathrooms) && bathrooms > 0 && bathrooms < 20) {
            data.bathrooms = bathrooms
            console.log(`Banheiros extraídos: ${bathrooms}`)
            break
          }
        }
        if (data.bathrooms) break
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
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const parking = parseInt(match[1])
          if (!isNaN(parking) && parking >= 0 && parking < 20) {
            data.parking = parking
            console.log(`Vagas extraídas: ${parking}`)
            break
          }
        }
        if (data.parking) break
      }

      // Determinar tipo de imóvel
      const typeKeywords = {
        apartment: ['apartamento', 'apto', 'flat', 'studio', 'residencial', 'cobertura', 'townhouse'],
        house: ['casa', 'sobrado', 'bangalô', 'mansão', 'residência', 'vila'],
        commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório', 'office', 'loft'],
        land: ['terreno', 'lote', 'chácara', 'sítio', 'fazenda', 'área']
      }

      const lowerText = textContent.toLowerCase()
      for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          data.type = type as any
          console.log(`Tipo de imóvel detectado: ${type}`)
          break
        }
      }

      // Determinar status do imóvel
      if (lowerText.includes('lançamento') || lowerText.includes('construção') || lowerText.includes('obra') || lowerText.includes('em obras')) {
        data.status = 'construction'
      } else if (lowerText.includes('pronto') || lowerText.includes('ready') || lowerText.includes('pronto para morar')) {
        data.status = 'available'
      } else {
        data.status = 'available'
      }

      // Extrair endereço
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
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const address = match[1].trim()
          if (address.length > 10 && address.length < 200) {
            const addressComponents = this.parseAddress(address)
            data.address = {
              ...addressComponents,
              country: 'Brasil'
            }
            console.log(`Endereço extraído:`, addressComponents)
            break
          }
        }
        if (data.address) break
      }

      // Extrair características
      const featureKeywords = [
        'piscina', 'academia', 'playground', 'churrasqueira', 'elevador', 'portaria',
        'ar condicionado', 'sacada', 'jardim', 'suite', 'mobiliado', 'novo',
        'residencial', 'lançamento', 'pronto para morar', 'em construção',
        'segurança 24h', 'porteiro', 'área de lazer', 'quadra', 'sala de festas',
        'vista para o mar', 'vista para a montanha', 'vista panorâmica'
      ]
      const features: string[] = []
      
      for (const keyword of featureKeywords) {
        if (lowerText.includes(keyword)) {
          features.push(keyword)
        }
      }
      
      if (features.length > 0) {
        data.features = features
        console.log(`Características extraídas:`, features)
      }
    }
  }

  private async extractFromGoogleDoc(url: string, html: string, data: Partial<ExtractedDocumentData>): Promise<void> {
    console.log('Processando Google Doc...')
    await this.extractGenericData(html, data)
  }

  private async extractFromGoogleSheet(url: string, html: string, data: Partial<ExtractedDocumentData>): Promise<void> {
    console.log('Processando Google Sheet...')
    await this.extractGenericData(html, data)
  }

  private async extractGenericData(html: string, data: Partial<ExtractedDocumentData>): Promise<void> {
    // Extrair preços com padrões mais avançados
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
      /([\d.,]+)\s*R\$/gi,
      /preço[:\s]*([\d.,]+)/gi,
      /valor[:\s]*([\d.,]+)/gi
    ]
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern)
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.')
        const price = parseFloat(priceStr)
        if (!isNaN(price) && price > 0) {
          data.price = price
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
      /(\d+)\s*sq\s*m/gi,
      /(\d+)\s*metros²/gi
    ]
    
    for (const pattern of areaPatterns) {
      const match = html.match(pattern)
      if (match) {
        const area = parseInt(match[1])
        if (!isNaN(area) && area > 0 && area < 10000) {
          data.area = area
          break
        }
      }
    }

    // Extrair quartos
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
          data.bedrooms = bedrooms
          break
        }
      }
    }

    // Extrair banheiros
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
          data.bathrooms = bathrooms
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
          data.parking = parking
          break
        }
      }
    }

    // Determinar tipo de imóvel
    const typeKeywords = {
      apartment: ['apartamento', 'apto', 'flat', 'studio', 'residencial', 'cobertura'],
      house: ['casa', 'sobrado', 'bangalô', 'mansão', 'residência', 'vila'],
      commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório', 'office', 'loft'],
      land: ['terreno', 'lote', 'chácara', 'sítio', 'fazenda', 'área']
    }

    const lowerHtml = html.toLowerCase()
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerHtml.includes(keyword))) {
        data.type = type as any
        break
      }
    }

    // Determinar status do imóvel
    if (lowerHtml.includes('lançamento') || lowerHtml.includes('construção') || lowerHtml.includes('obra') || lowerHtml.includes('em obras')) {
      data.status = 'construction'
    } else if (lowerHtml.includes('pronto') || lowerHtml.includes('ready') || lowerHtml.includes('pronto para morar')) {
      data.status = 'available'
    } else {
      data.status = 'available'
    }

    // Extrair endereço
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
          const addressComponents = this.parseAddress(address)
          data.address = {
            ...addressComponents,
            country: 'Brasil'
          }
          break
        }
      }
    }

    // Extrair características
    const featureKeywords = [
      'piscina', 'academia', 'playground', 'churrasqueira', 'elevador', 'portaria',
      'ar condicionado', 'sacada', 'jardim', 'suite', 'mobiliado', 'novo',
      'residencial', 'lançamento', 'pronto para morar', 'em construção',
      'segurança 24h', 'porteiro', 'área de lazer', 'quadra', 'sala de festas',
      'vista para o mar', 'vista para a montanha', 'vista panorâmica'
    ]
    const features: string[] = []
    
    for (const keyword of featureKeywords) {
      if (lowerHtml.includes(keyword)) {
        features.push(keyword)
      }
    }
    
    if (features.length > 0) {
      data.features = features
    }
  }

  private extractTextFromHTML(html: string): string {
    // Remover tags HTML e extrair texto limpo
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove CSS
      .replace(/<[^>]+>/g, ' ') // Remove todas as tags HTML
      .replace(/\s+/g, ' ') // Normaliza espaços
      .replace(/&nbsp;/g, ' ') // Remove entidades HTML
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
    
    return text
  }

  private async extractImagesFromDocument(html: string, baseUrl: string): Promise<string[]> {
    const images: string[] = []
    
    // Padrões para extrair imagens de documentos
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
    
    // Remover duplicatas e limitar a 15 imagens
    return Array.from(new Set(images)).slice(0, 15)
  }

  private isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const lowerUrl = url.toLowerCase()
    
    // Verificar se tem extensão de imagem
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return true
    }
    
    // Verificar se parece ser uma URL de imagem
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

  public async processGoogleDriveLinks(links: any[]): Promise<ExtractedDocumentData[]> {
    const extractedData: ExtractedDocumentData[] = []
    
    for (const link of links) {
      try {
        if (this.isGoogleDriveUrl(link.url)) {
          console.log(`Processando link do Google Drive: ${link.url}`)
          
          const data = await this.extractFromGoogleDrive(link.url)
          
          if (data.title) {
            const extractedDoc: ExtractedDocumentData = {
              title: data.title,
              description: data.description || 'Documento do Google Drive',
              price: data.price,
              area: data.area,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              parking: data.parking,
              address: data.address || { country: 'Brasil' },
              type: data.type || 'apartment',
              status: data.status || 'available',
              features: data.features || [],
              images: data.images || [],
              documents: data.documents || [],
              sourceUrl: link.url,
              sourceId: link.id
            }
            
            extractedData.push(extractedDoc)
            console.log(`Documento processado: ${extractedDoc.title}`)
          }
          
          // Pausa entre processamentos
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`Erro ao processar link ${link.url}:`, error)
      }
    }
    
    return extractedData
  }

  private extractTableData(textContent: string): any[] {
    const units: any[] = []
    
    try {
      // Padrões para identificar tabelas de vendas de imóveis
      const tablePatterns = [
        // Padrão para tabelas com colunas: UNIDADES, BLOCO, ÁREA M², TIPO, VAGAS, DE, POR, etc.
        /(\d+)\s+(\d+)\s+([\d.,]+)\s+([^\s]+)\s+([^\s]+)\s+([\d.,]+)\s+([\d.,]+)/gi,
        // Padrão mais flexível para tabelas
        /(\d+)\s+([\d.,]+)\s+([^\s]+)\s+([^\s]+)\s+([\d.,]+)\s+([\d.,]+)/gi,
        // Padrão para linhas com dados separados por espaços
        /(\d+)\s+([\d.,]+)\s+([^\s]+)/gi
      ]
      
      // Tentar extrair dados de tabelas estruturadas
      for (const pattern of tablePatterns) {
        let match
        while ((match = pattern.exec(textContent)) !== null) {
          const unitData = this.parseTableRow(match)
          if (unitData && this.isValidUnitData(unitData)) {
            units.push(unitData)
          }
        }
      }
      
      // Se não encontrou com regex, tentar extrair por linhas
      if (units.length === 0) {
        const lines = textContent.split('\n')
        for (const line of lines) {
          const unitData = this.parseTableLine(line)
          if (unitData && this.isValidUnitData(unitData)) {
            units.push(unitData)
          }
        }
      }
      
    } catch (error) {
      console.error('Erro ao extrair dados da tabela:', error)
    }
    
    return units
  }

  private parseTableRow(match: RegExpExecArray): any | null {
    try {
      const [, unit, block, area, type, parking, originalPrice, promoPrice] = match
      
      // Converter área
      const areaNum = parseFloat(area.replace(',', '.'))
      if (isNaN(areaNum) || areaNum <= 0) return null
      
      // Converter preços
      const originalPriceNum = this.parsePrice(originalPrice)
      const promoPriceNum = this.parsePrice(promoPrice)
      const finalPrice = promoPriceNum || originalPriceNum
      
      if (!finalPrice) return null
      
      // Extrair número de quartos do tipo
      const bedrooms = this.extractBedroomsFromType(type)
      
      // Determinar status baseado no preço
      const status = promoPriceNum ? 'available' : 'available'
      
      return {
        unit: unit,
        block: block,
        area: areaNum,
        bedrooms: bedrooms,
        bathrooms: bedrooms >= 2 ? 2 : 1, // Estimativa baseada em quartos
        parking: this.parseParking(parking),
        price: finalPrice,
        originalPrice: originalPriceNum,
        promoPrice: promoPriceNum,
        type: bedrooms >= 3 ? 'apartment' : 'apartment',
        status: status,
        features: this.generateFeatures(bedrooms, areaNum, parking)
      }
    } catch (error) {
      console.error('Erro ao processar linha da tabela:', error)
      return null
    }
  }

  private parseTableLine(line: string): any | null {
    try {
      // Limpar linha
      const cleanLine = line.trim()
      if (cleanLine.length < 10) return null
      
      // Procurar por padrões de dados de imóvel na linha
      const areaMatch = cleanLine.match(/([\d.,]+)\s*m²/i)
      const priceMatch = cleanLine.match(/R\$\s*([\d.,]+)/i)
      const unitMatch = cleanLine.match(/(\d+)/)
      const typeMatch = cleanLine.match(/(\d+)\s*[Qq]ts?/i)
      
      if (!areaMatch || !priceMatch) return null
      
      const area = parseFloat(areaMatch[1].replace(',', '.'))
      const price = this.parsePrice(priceMatch[1])
      const bedrooms = typeMatch ? parseInt(typeMatch[1]) : 2
      
      if (isNaN(area) || !price || area <= 0) return null
      
      return {
        unit: unitMatch ? unitMatch[1] : 'N/A',
        area: area,
        bedrooms: bedrooms,
        bathrooms: bedrooms >= 2 ? 2 : 1,
        parking: 1, // Estimativa padrão
        price: price,
        type: 'apartment',
        status: 'available',
        features: this.generateFeatures(bedrooms, area, 1)
      }
    } catch (error) {
      return null
    }
  }

  private parsePrice(priceStr: string): number | null {
    try {
      if (!priceStr) return null
      const cleanPrice = priceStr.replace(/\./g, '').replace(',', '.')
      const price = parseFloat(cleanPrice)
      return isNaN(price) || price <= 0 ? null : price
    } catch {
      return null
    }
  }

  private extractBedroomsFromType(type: string): number {
    if (!type) return 2
    
    const typeLower = type.toLowerCase()
    if (typeLower.includes('1')) return 1
    if (typeLower.includes('2')) return 2
    if (typeLower.includes('3')) return 3
    if (typeLower.includes('4')) return 4
    if (typeLower.includes('5')) return 5
    
    // Padrões específicos
    if (typeLower.includes('studio') || typeLower.includes('kitnet')) return 1
    if (typeLower.includes('loft')) return 1
    
    return 2 // Padrão
  }

  private parseParking(parkingStr: string): number {
    if (!parkingStr) return 1
    
    const parkingLower = parkingStr.toLowerCase()
    if (parkingLower.includes('dupla')) return 2
    if (parkingLower.includes('simples')) return 1
    
    const numMatch = parkingStr.match(/(\d+)/)
    return numMatch ? parseInt(numMatch[1]) : 1
  }

  private generateFeatures(bedrooms: number, area: number, parking: number): string[] {
    const features: string[] = []
    
    if (bedrooms >= 3) features.push('3+ quartos')
    if (area >= 100) features.push('Área ampla')
    if (parking >= 2) features.push('2+ vagas')
    if (area >= 150) features.push('Imóvel espaçoso')
    
    return features
  }

  private isValidUnitData(unitData: any): boolean {
    return unitData && 
           unitData.area && 
           unitData.area > 0 && 
           unitData.price && 
           unitData.price > 0 &&
           unitData.bedrooms && 
           unitData.bedrooms > 0
  }
}
