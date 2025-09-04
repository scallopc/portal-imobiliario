const { chromium } = require('playwright')
const cheerio = require('cheerio')
const { adminDb } = require('./firebase-admin')

class AdvancedCrawler {
  constructor() {
    this.browser = null
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async crawlUrl(url) {
    try {
      await this.initialize()
      const page = await this.browser.newPage()
      
      // Configurar user agent e viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      await page.setViewportSize({ width: 1920, height: 1080 })

      console.log(`🌐 Navegando para: ${url}`)
      
      // Navegar com timeout
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })

      // Aguardar um pouco mais para JS carregar
      await page.waitForTimeout(2000)

      // Obter HTML renderizado
      const html = await page.content()
      await page.close()

      // Processar com Cheerio
      return await this.extractPropertyData(html, url)

    } catch (error) {
      console.error(`❌ Erro ao crawlear ${url}:`, error)
      return null
    }
  }

  async extractPropertyData(html, url) {
    const $ = cheerio.load(html)
    
    // 1. Extrair dados estruturados (JSON-LD)
    const structuredData = this.extractStructuredData($)
    
    // 2. Extrair Open Graph tags
    const ogData = this.extractOpenGraphData($)
    
    // 3. Extrair dados do HTML
    const htmlData = this.extractHTMLData($)
    
    // 4. Combinar e priorizar dados
    const property = this.combineData(structuredData, ogData, htmlData, url)
    
    return property
  }

  extractStructuredData($) {
    try {
      const jsonLdScripts = $('script[type="application/ld+json"]')
      
      for (let i = 0; i < jsonLdScripts.length; i++) {
        const script = jsonLdScripts.eq(i)
        const content = script.html()
        
        if (content) {
          try {
            const data = JSON.parse(content)
            
            // Procurar por RealEstateListing ou Property
            if (data['@type'] === 'RealEstateListing' || 
                data['@type'] === 'Property' ||
                data['@type'] === 'Product' ||
                (Array.isArray(data) && data.some((item) => 
                  item['@type'] === 'RealEstateListing' || 
                  item['@type'] === 'Property'
                ))) {
              
              const listing = Array.isArray(data) ? 
                data.find((item) => 
                  item['@type'] === 'RealEstateListing' || 
                  item['@type'] === 'Property'
                ) : data
              
              if (listing) {
                console.log(`📊 Dados estruturados encontrados: ${listing['@type']}`)
                return listing
              }
            }
          } catch (parseError) {
            console.log('⚠️ Erro ao parsear JSON-LD:', parseError)
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao extrair dados estruturados:', error)
    }
    
    return null
  }

  extractOpenGraphData($) {
    const ogData = {}
    
    // Extrair tags Open Graph
    ogData.title = $('meta[property="og:title"]').attr('content') || 
                   $('meta[name="og:title"]').attr('content')
    
    ogData.description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="og:description"]').attr('content')
    
    ogData.image = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="og:image"]').attr('content')
    
    ogData.url = $('meta[property="og:url"]').attr('content') || 
                 $('meta[name="og:url"]').attr('content')
    
    ogData.type = $('meta[property="og:type"]').attr('content') || 
                  $('meta[name="og:type"]').attr('content')
    
    ogData.site_name = $('meta[property="og:site_name"]').attr('content') || 
                       $('meta[name="og:site_name"]').attr('content')
    
    return ogData
  }

  extractHTMLData($) {
    const data = {}
    
    // Título
    data.title = $('title').text().trim() || 
                 $('h1').first().text().trim() ||
                 $('.title').first().text().trim() ||
                 $('[class*="title"]').first().text().trim()
    
    // Descrição
    data.description = $('meta[name="description"]').attr('content') ||
                      $('.description').first().text().trim() ||
                      $('[class*="description"]').first().text().trim() ||
                      $('p').first().text().trim()
    
    // Preço - múltiplos padrões
    const priceSelectors = [
      '[class*="price"]',
      '[class*="valor"]',
      '[class*="preco"]',
      '.price',
      '.valor',
      '.preco',
      '[data-price]',
      '[data-valor]'
    ]
    
    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text().trim()
      if (priceText) {
        const price = this.extractPrice(priceText)
        if (price) {
          data.price = price
          break
        }
      }
    }
    
    // Área - múltiplos padrões
    const areaSelectors = [
      '[class*="area"]',
      '[class*="metragem"]',
      '[class*="m2"]',
      '.area',
      '.metragem',
      '[data-area]',
      '[data-metragem]'
    ]
    
    for (const selector of areaSelectors) {
      const areaText = $(selector).first().text().trim()
      if (areaText) {
        const area = this.extractArea(areaText)
        if (area) {
          data.area = area
          break
        }
      }
    }
    
    // Quartos
    const bedroomSelectors = [
      '[class*="quarto"]',
      '[class*="dormitorio"]',
      '[class*="suite"]',
      '.quarto',
      '.dormitorio',
      '.suite',
      '[data-quartos]',
      '[data-dormitorios]'
    ]
    
    for (const selector of bedroomSelectors) {
      const bedroomText = $(selector).first().text().trim()
      if (bedroomText) {
        const bedrooms = this.extractBedrooms(bedroomText)
        if (bedrooms) {
          data.bedrooms = bedrooms
          break
        }
      }
    }
    
    // Banheiros
    const bathroomSelectors = [
      '[class*="banheiro"]',
      '[class*="wc"]',
      '.banheiro',
      '.wc',
      '[data-banheiros]'
    ]
    
    for (const selector of bathroomSelectors) {
      const bathroomText = $(selector).first().text().trim()
      if (bathroomText) {
        const bathrooms = this.extractBathrooms(bathroomText)
        if (bathrooms) {
          data.bathrooms = bathrooms
          break
        }
      }
    }
    
    // Vagas de garagem
    const parkingSelectors = [
      '[class*="garagem"]',
      '[class*="vaga"]',
      '[class*="parking"]',
      '.garagem',
      '.vaga',
      '.parking',
      '[data-garagem]',
      '[data-vagas]'
    ]
    
    for (const selector of parkingSelectors) {
      const parkingText = $(selector).first().text().trim()
      if (parkingText) {
        const parking = this.extractParking(parkingText)
        if (parking) {
          data.parking = parking
          break
        }
      }
    }
    
    // Imagens
    data.images = this.extractImages($)
    
    return data
  }

  extractPrice(text) {
    const pricePatterns = [
      /R\$\s*([\d.,]+)/i,
      /([\d.,]+)\s*reais/i,
      /([\d.,]+)\s*R\$/i,
      /preço[:\s]*R\$\s*([\d.,]+)/i,
      /valor[:\s]*R\$\s*([\d.,]+)/i,
      /([\d.,]+)\s*mil/i,
      /([\d.,]+)\s*k/i
    ]
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern)
      if (match) {
        let price = parseFloat(match[1].replace(/[.,]/g, ''))
        
        // Se contém "mil" ou "k", multiplicar por 1000
        if (text.toLowerCase().includes('mil') || text.toLowerCase().includes('k')) {
          price *= 1000
        }
        
        if (price > 0 && price < 10000000) { // Validação razoável
          return price
        }
      }
    }
    
    return null
  }

  extractArea(text) {
    const areaPatterns = [
      /(\d+)\s*m²/i,
      /(\d+)\s*metros\s*quadrados/i,
      /(\d+)\s*m2/i,
      /área[:\s]*(\d+)/i,
      /metragem[:\s]*(\d+)/i,
      /(\d+)\s*metros/i
    ]
    
    for (const pattern of areaPatterns) {
      const match = text.match(pattern)
      if (match) {
        const area = parseInt(match[1])
        if (area > 0 && area < 10000) { // Validação razoável
          return area
        }
      }
    }
    
    return null
  }

  extractBedrooms(text) {
    const bedroomPatterns = [
      /(\d+)\s*quarto/i,
      /(\d+)\s*dormitório/i,
      /(\d+)\s*suíte/i,
      /quarto[:\s]*(\d+)/i,
      /dormitório[:\s]*(\d+)/i,
      /suíte[:\s]*(\d+)/i
    ]
    
    for (const pattern of bedroomPatterns) {
      const match = text.match(pattern)
      if (match) {
        const bedrooms = parseInt(match[1])
        if (bedrooms > 0 && bedrooms < 20) { // Validação razoável
          return bedrooms
        }
      }
    }
    
    return null
  }

  extractBathrooms(text) {
    const bathroomPatterns = [
      /(\d+)\s*banheiro/i,
      /(\d+)\s*wc/i,
      /banheiro[:\s]*(\d+)/i,
      /wc[:\s]*(\d+)/i
    ]
    
    for (const pattern of bathroomPatterns) {
      const match = text.match(pattern)
      if (match) {
        const bathrooms = parseInt(match[1])
        if (bathrooms > 0 && bathrooms < 20) { // Validação razoável
          return bathrooms
        }
      }
    }
    
    return null
  }

  extractParking(text) {
    const parkingPatterns = [
      /(\d+)\s*vaga/i,
      /(\d+)\s*garagem/i,
      /vaga[:\s]*(\d+)/i,
      /garagem[:\s]*(\d+)/i
    ]
    
    for (const pattern of parkingPatterns) {
      const match = text.match(pattern)
      if (match) {
        const parking = parseInt(match[1])
        if (parking >= 0 && parking < 20) { // Validação razoável
          return parking
        }
      }
    }
    
    return null
  }

  extractImages($) {
    const images = []
    
    // Extrair imagens de várias fontes
    $('img').each((_, img) => {
      const src = $(img).attr('src')
      const dataSrc = $(img).attr('data-src')
      const dataLazy = $(img).attr('data-lazy')
      
      const imageUrl = src || dataSrc || dataLazy
      
      if (imageUrl && this.isValidImageUrl(imageUrl)) {
        images.push(imageUrl)
      }
    })
    
    // Extrair imagens de background CSS
    $('[style*="background-image"]').each((_, element) => {
      const style = $(element).attr('style')
      if (style) {
        const match = style.match(/url\(['"]?([^'"]+)['"]?\)/)
        if (match && this.isValidImageUrl(match[1])) {
          images.push(match[1])
        }
      }
    })
    
    // Remover duplicatas e limitar
    return [...new Set(images)].slice(0, 15)
  }

  isValidImageUrl(url) {
    if (!url || url.length < 10) return false
    
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const hasValidExtension = validExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    )
    
    const invalidKeywords = ['logo', 'icon', 'avatar', 'profile', 'banner']
    const hasInvalidKeyword = invalidKeywords.some(keyword => 
      url.toLowerCase().includes(keyword)
    )
    
    return hasValidExtension && !hasInvalidKeyword
  }

  combineData(structuredData, ogData, htmlData, url) {
    // Priorizar dados estruturados, depois OG, depois HTML
    const title = structuredData?.name || 
                  ogData.title || 
                  htmlData.title || 
                  'Imóvel sem título'
    
    const description = structuredData?.description || 
                       ogData.description || 
                       htmlData.description || 
                       'Descrição não disponível'
    
    const price = structuredData?.price || htmlData.price
    const area = structuredData?.area || 
                 structuredData?.floorSize?.value || 
                 htmlData.area
    
    const bedrooms = structuredData?.numberOfRooms || htmlData.bedrooms
    const bathrooms = structuredData?.numberOfBathroomsTotal || htmlData.bathrooms
    const parking = structuredData?.parkingSpace || htmlData.parking
    
    // Determinar tipo de imóvel
    const type = this.determinePropertyType(title, description, structuredData)
    
    // Determinar status
    const status = structuredData?.availability || 'available'
    
    // Extrair características
    const features = this.extractFeatures(title, description, structuredData)
    
    // Combinar imagens
    const images = [
      ...(structuredData?.image ? (Array.isArray(structuredData.image) ? structuredData.image : [structuredData.image]) : []),
      ...(ogData.image ? [ogData.image] : []),
      ...htmlData.images
    ].filter((img, index, arr) => arr.indexOf(img) === index) // Remover duplicatas
    
    // Extrair endereço
    const address = structuredData?.address ? {
      street: structuredData.address.streetAddress,
      city: structuredData.address.addressLocality,
      state: structuredData.address.addressRegion,
      zipCode: structuredData.address.postalCode
    } : undefined
    
    return {
      title,
      description,
      price: price || undefined,
      area: area || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      parking: parking || undefined,
      type,
      status,
      features,
      images,
      sourceUrl: url,
      sourceId: this.generateSourceId(url),
      address,
      availability: structuredData?.availability,
      financing: this.extractFinancing(description),
      conditions: this.extractConditions(description)
    }
  }

  determinePropertyType(title, description, structuredData) {
    const text = `${title} ${description}`.toLowerCase()
    
    if (structuredData?.type) {
      if (structuredData.type.includes('apartment') || structuredData.type.includes('apartamento')) return 'apartment'
      if (structuredData.type.includes('house') || structuredData.type.includes('casa')) return 'house'
      if (structuredData.type.includes('commercial') || structuredData.type.includes('comercial')) return 'commercial'
    }
    
    if (text.includes('apartamento') || text.includes('apto') || text.includes('apartment')) return 'apartment'
    if (text.includes('casa') || text.includes('house') || text.includes('residencial')) return 'house'
    if (text.includes('comercial') || text.includes('commercial') || text.includes('loja')) return 'commercial'
    if (text.includes('terreno') || text.includes('land') || text.includes('lote')) return 'land'
    
    return 'apartment' // Default
  }

  extractFeatures(title, description, structuredData) {
    const features = []
    const text = `${title} ${description}`.toLowerCase()
    
    const featureKeywords = [
      'mobiliado', 'furnished', 'mobiliada',
      'lançamento', 'launch', 'novo', 'new',
      'pronto', 'ready', 'entregue',
      'construção', 'construction', 'obra',
      'piscina', 'pool', 'swimming',
      'academia', 'gym', 'fitness',
      'playground', 'playground',
      'churrasqueira', 'barbecue', 'bbq',
      'varanda', 'balcony', 'terraço',
      'sacada', 'balcony',
      'vista', 'view', 'mar', 'sea',
      'ar condicionado', 'air conditioning',
      'elevador', 'elevator',
      'portaria', 'concierge',
      'segurança', 'security',
      'garagem', 'parking', 'vaga'
    ]
    
    for (const keyword of featureKeywords) {
      if (text.includes(keyword)) {
        features.push(keyword)
      }
    }
    
    return features
  }

  extractFinancing(description) {
    const text = description.toLowerCase()
    
    if (text.includes('financiamento') || text.includes('financing')) {
      return 'Disponível'
    }
    
    if (text.includes('à vista') || text.includes('cash')) {
      return 'À vista'
    }
    
    return undefined
  }

  extractConditions(description) {
    const text = description.toLowerCase()
    
    if (text.includes('condições especiais') || text.includes('special conditions')) {
      return 'Condições especiais disponíveis'
    }
    
    if (text.includes('desconto') || text.includes('discount')) {
      return 'Desconto disponível'
    }
    
    return undefined
  }

  generateSourceId(url) {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname + urlObj.pathname
    } catch {
      return url
    }
  }

  async saveProperty(property) {
    // Remover campos undefined antes de salvar
    const cleanProperty = {}
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
      address: cleanProperty.address || null,
      availability: cleanProperty.availability || null,
      financing: cleanProperty.financing || null,
      conditions: cleanProperty.conditions || null,
      
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
      console.log(`✅ Propriedade salva: ${docRef.id} - ${propertyData.title}`)
      return docRef.id
    } catch (error) {
      console.error('❌ Erro ao salvar propriedade:', error)
      throw error
    }
  }
}

module.exports = { AdvancedCrawler }
