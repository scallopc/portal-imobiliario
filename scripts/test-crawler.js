// Carregar variáveis de ambiente
require('dotenv').config()

const admin = require('firebase-admin')

// Configurar Firebase Admin usando variáveis de ambiente
function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let projectId, clientEmail, privateKey;

  if (svcJson) {
    try {
      const parsed = JSON.parse(svcJson);
      projectId = parsed.project_id;
      clientEmail = parsed.client_email;
      privateKey = (parsed.private_key || '').replace(/\\n/g, "\n");
    } catch (e) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON');
    }
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = getPrivateKey();
  }

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    throw new Error(
      'Missing Firebase Admin credentials. Provide FIREBASE_SERVICE_ACCOUNT_KEY (preferred) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }
}

const db = admin.firestore()

// Versão JavaScript do crawler
class PropertyCrawler {
  constructor() {
    this.adminDb = db;
  }

  async fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  isPropertyLink(url) {
    // Ignorar links internos do Linktree e outros serviços
    const ignorePatterns = [
      'linktr.ee/s/about',
      'linktr.ee/s/',
      'mailto:',
      'tel:',
      'whatsapp',
      'instagram.com',
      'facebook.com',
      'youtube.com'
    ];
    
    const lowerUrl = url.toLowerCase();
    if (ignorePatterns.some(pattern => lowerUrl.includes(pattern))) {
      return false;
    }
    
    // Verificar se é um link externo válido
    return url.startsWith('http') && !url.includes('linktr.ee');
  }

  async extractLinksFromLinktree(html, baseUrl) {
    const links = [];
    
    // Padrões para extrair links do Linktree
    const linkPatterns = [
      /<a[^>]*href="([^"]*)"[^>]*>/gi,
      /href="([^"]*)"[^>]*>/gi,
      /"url":"([^"]*)"/gi
    ];
    
    for (const pattern of linkPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        if (url && this.isPropertyLink(url)) {
          // Converter URLs relativas para absolutas
          const absoluteUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href;
          links.push(absoluteUrl);
        }
      }
    }
    
    // Remover duplicatas
    const uniqueLinks = Array.from(new Set(links));
    return uniqueLinks;
  }

  // Extrair imagens do HTML
  extractImages(html, baseUrl) {
    const images = [];
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imageUrl = match[1];
      if (imageUrl && !imageUrl.startsWith('data:')) {
        // Converter URL relativa para absoluta
        const absoluteUrl = this.resolveUrl(imageUrl, baseUrl);
        if (absoluteUrl) {
          images.push(absoluteUrl);
        }
      }
    }
    
    // Remover duplicatas e limitar a 20 imagens
    return [...new Set(images)].slice(0, 20);
  }

  // Extrair PDFs do HTML
  extractPDFs(html, baseUrl) {
    const pdfs = [];
    const pdfRegex = /<a[^>]+href="([^"]*\.pdf)"[^>]*>/gi;
    let match;
    
    while ((match = pdfRegex.exec(html)) !== null) {
      const pdfUrl = match[1];
      if (pdfUrl) {
        const absoluteUrl = this.resolveUrl(pdfUrl, baseUrl);
        if (absoluteUrl) {
          pdfs.push(absoluteUrl);
        }
      }
    }
    
    return [...new Set(pdfs)];
  }

  // Extrair informações adicionais do HTML
  extractAdditionalInfo(html) {
    const info = {};
    
    // Extrair características do imóvel
    const features = [];
    const featureKeywords = [
      'ar condicionado', 'elevador', 'piscina', 'academia', 'segurança 24h',
      'porteiro', 'sacada', 'jardim', 'suite', 'mobiliado', 'novo',
      'residencial', 'comercial', 'lançamento', 'pronto para morar'
    ];
    
    const lowerHtml = html.toLowerCase();
    for (const feature of featureKeywords) {
      if (lowerHtml.includes(feature)) {
        features.push(feature);
      }
    }
    
    info.features = features;
    
    // Extrair endereço aproximado
    const addressMatch = html.match(/(?:endereço|localização|localizado)[:\s]*([^<>\n]+)/i);
    if (addressMatch) {
      info.address = addressMatch[1].trim();
    }
    
    // Extrair informações de contato
    const phoneMatch = html.match(/(?:telefone|fone|tel)[:\s]*([\d\s\-\(\)]+)/i);
    if (phoneMatch) {
      info.phone = phoneMatch[1].trim();
    }
    
    const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
      info.email = emailMatch[1];
    }
    
    return info;
  }

  // Resolver URL relativa para absoluta
  resolveUrl(url, baseUrl) {
    try {
      if (url.startsWith('http')) {
        return url;
      }
      
      const base = new URL(baseUrl);
      const resolved = new URL(url, base);
      return resolved.href;
    } catch (error) {
      console.error('Erro ao resolver URL:', error);
      return null;
    }
  }

  async extractFromHTML(html, url) {
    const property = {
      sourceUrl: url
    };

    // Extrair título
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      property.title = titleMatch[1].trim();
    }

    // Extrair descrição
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    if (descMatch) {
      property.description = descMatch[1].trim();
    }

    // Extrair preço com mais padr
    const pricePatterns = [
      /R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*mil/gi,
      /preço[:\s]*R\$\s*([\d.,]+)/gi,
      /valor[:\s]*R\$\s*([\d.,]+)/gi,
      /a partir de[:\s]*R\$\s*([\d.,]+)/gi,
      /desde[:\s]*R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*reais/gi
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.');
        const price = parseFloat(priceStr);
        if (!isNaN(price)) {
          property.price = price;
          break;
        }
      }
    }

    // Extrair área com mais padrões
    const areaPatterns = [
      /(\d+)\s*m²/gi,
      /(\d+)\s*metros\s*quadrados/gi,
      /área[:\s]*(\d+)/gi,
      /(\d+)\s*m2/gi,
      /(\d+)\s*metros/gi
    ];
    
    for (const pattern of areaPatterns) {
      const match = html.match(pattern);
      if (match) {
        const area = parseInt(match[1]);
        if (!isNaN(area)) {
          property.area = area;
          break;
        }
      }
    }

    // Extrair número de quartos/dormitórios
    const bedroomPatterns = [
      /(\d+)\s*(?:quarto|dormitório|bedroom|bed)/i,
      /(?:quarto|dormitório|bedroom|bed)\s*(\d+)/i,
      /(\d+)\s*suítes?/i
    ];
    
    for (const pattern of bedroomPatterns) {
      const match = html.match(pattern);
      if (match) {
        const bedrooms = parseInt(match[1]);
        if (!isNaN(bedrooms)) {
          property.bedrooms = bedrooms;
          break;
        }
      }
    }

    // Extrair número de banheiros
    const bathroomPatterns = [
      /(\d+)\s*(?:banheiro|bathroom|bath)/i,
      /(?:banheiro|bathroom|bath)\s*(\d+)/i
    ];
    
    for (const pattern of bathroomPatterns) {
      const match = html.match(pattern);
      if (match) {
        const bathrooms = parseInt(match[1]);
        if (!isNaN(bathrooms)) {
          property.bathrooms = bathrooms;
          break;
        }
      }
    }

    // Extrair vagas de estacionamento
    const parkingMatch = html.match(/(\d+)\s*(?:vaga|parking|garage)/i);
    if (parkingMatch) {
      const parking = parseInt(parkingMatch[1]);
      if (!isNaN(parking)) {
        property.parking = parking;
      }
    }

    // Extrair imagens
    property.images = this.extractImages(html, url);

    // Extrair PDFs
    property.pdfs = this.extractPDFs(html, url);

    // Extrair informações adicionais
    property.additionalInfo = this.extractAdditionalInfo(html);

    // Determinar tipo de imóvel
    const typeKeywords = {
      apartment: ['apartamento', 'apto', 'flat', 'studio', 'residencial'],
      house: ['casa', 'sobrado', 'bangalô', 'mansão', 'residência'],
      commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório', 'office'],
      land: ['terreno', 'lote', 'chácara', 'sítio']
    };

    const lowerHtml = html.toLowerCase();
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerHtml.includes(keyword))) {
        property.type = type;
        break;
      }
    }

    // Determinar status do imóvel
    if (lowerHtml.includes('lançamento') || lowerHtml.includes('construção') || lowerHtml.includes('obra')) {
      property.status = 'construction';
    } else if (lowerHtml.includes('pronto') || lowerHtml.includes('ready')) {
      property.status = 'ready';
    } else {
      property.status = 'available';
    }

    return property;
  }

  async crawlLinktree(linkData) {
    try {
      console.log(`Crawling Linktree: ${linkData.url}`);
      
      const response = await this.fetchWithTimeout(linkData.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Extrair links de propriedades do Linktree
      const propertyLinks = await this.extractLinksFromLinktree(html, linkData.url);
      
      console.log(`Encontrados ${propertyLinks.length} links externos no Linktree`);
      
      const properties = [];
      
      // Processar cada link de propriedade encontrado
      for (const propertyUrl of propertyLinks) {
        try {
          console.log(`Processando propriedade: ${propertyUrl}`);
          
          const propertyResponse = await this.fetchWithTimeout(propertyUrl);
          if (!propertyResponse.ok) {
            console.log(`Erro ao acessar ${propertyUrl}: ${propertyResponse.status}`);
            continue;
          }
          
          const propertyHtml = await propertyResponse.text();
          const extractedData = await this.extractFromHTML(propertyHtml, propertyUrl);
          
          // Validar dados mínimos
          if (!extractedData.title) {
            console.log(`Título não encontrado para ${propertyUrl}`);
            continue;
          }
          
          const property = {
            title: extractedData.title,
            description: extractedData.description || 'Descrição não disponível',
            price: extractedData.price,
            area: extractedData.area,
            address: { country: 'Brasil' },
            type: extractedData.type || 'apartment',
            status: 'available',
            sourceUrl: propertyUrl,
            sourceId: linkData.id,
            rawData: {
              extractedData: extractedData
            }
          };
          
          properties.push(property);
          
          // Pequena pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Erro ao processar propriedade ${propertyUrl}:`, error);
        }
      }
      
      return properties;
      
    } catch (error) {
      console.error(`Erro ao crawlear Linktree ${linkData.url}:`, error);
      return [];
    }
  }

  async saveProperty(property) {
    // Remover campos undefined antes de salvar
    const cleanProperty = {};
    for (const [key, value] of Object.entries(property)) {
      if (value !== undefined && value !== null) {
        cleanProperty[key] = value;
      }
    }

    // Estrutura completa da propriedade com todos os campos
    const propertyData = {
      // Campos básicos
      title: cleanProperty.title || '',
      description: cleanProperty.description || '',
      price: cleanProperty.price || null,
      area: cleanProperty.area || null,
      
      // Endereço completo
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Brasil',
        latitude: null,
        longitude: null
      },
      
      // Detalhes do imóvel
      type: cleanProperty.type || 'apartment',
      status: cleanProperty.status || 'available',
      bedrooms: cleanProperty.bedrooms || null,
      bathrooms: cleanProperty.bathrooms || null,
      parking: cleanProperty.parking || null,
      furnished: false,
      
      // Características
      features: cleanProperty.additionalInfo?.features || [],
      amenities: [],
      images: cleanProperty.images || [],
      
      // Metadados
      sourceUrl: cleanProperty.sourceUrl || '',
      sourceId: cleanProperty.sourceId || '',
      isActive: true,
      views: 0,
      favorites: 0,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Campos para processamento
      needsProcessing: true,
      processingStatus: 'pending',
      rawData: cleanProperty
    };

    // Salvar na coleção de dados brutos
    const docRef = await this.adminDb.collection('properties_raw').add(propertyData);
    console.log(`Dados brutos salvos: ${docRef.id} - ${propertyData.title}`);
    return docRef.id;
  }

  async updateLinkStatus(linkId, status, error) {
    try {
      console.log(`Atualizando status do link ${linkId} para: ${status}`);
      
      const updateData = {
        lastCrawled: new Date(),
        status,
      };
      
      if (error) {
        updateData.error = error;
        console.log(`Erro registrado: ${error}`);
      } else {
        updateData.error = null;
      }
      
      await this.adminDb.collection('links').doc(linkId).update(updateData);
      console.log(`Status atualizado com sucesso para: ${status}`);
      
    } catch (updateError) {
      console.error(`Erro ao atualizar status do link ${linkId}:`, updateError);
      throw updateError;
    }
  }

  async runCrawler() {
    console.log('Iniciando crawler de propriedades...');
    
    try {
      // Buscar links da coleção
      const linksSnapshot = await this.adminDb.collection('links')
        .limit(50)
        .get();

      if (linksSnapshot.empty) {
        console.log('Nenhum link encontrado na coleção');
        return;
      }

      console.log(`Encontrados ${linksSnapshot.size} links para processar`);

      const links = linksSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`Link encontrado: ${doc.id} - ${data.url} - ${data.type}`);
        return {
          id: doc.id,
          ...data
        };
      });

      let successCount = 0;
      let errorCount = 0;
      let totalProperties = 0;

      for (const link of links) {
        try {
          console.log(`\n--- Processando link: ${link.id} ---`);
          console.log(`URL: ${link.url}`);
          console.log(`Type: ${link.type}`);
          
          // Marcar como processando
          await this.updateLinkStatus(link.id, 'processing');

          // Crawlear o Linktree
          const properties = await this.crawlLinktree(link);
          
          console.log(`Propriedades encontradas: ${properties.length}`);
          
          if (properties.length > 0) {
            // Salvar cada propriedade encontrada
            for (const property of properties) {
              try {
                const propertyId = await this.saveProperty(property);
                console.log(`Propriedade salva: ${propertyId} - ${property.title}`);
                totalProperties++;
              } catch (saveError) {
                console.error(`Erro ao salvar propriedade:`, saveError);
              }
            }
            
            // Marcar como completado
            await this.updateLinkStatus(link.id, 'completed');
            successCount++;
          } else {
            // Marcar como erro se não encontrou propriedades
            await this.updateLinkStatus(link.id, 'error', 'Nenhuma propriedade encontrada');
            errorCount++;
          }

        } catch (error) {
          console.error(`Erro ao processar link ${link.id}:`, error);
          try {
            await this.updateLinkStatus(link.id, 'error', error instanceof Error ? error.message : 'Erro desconhecido');
          } catch (updateError) {
            console.error('Erro ao atualizar status:', updateError);
          }
          errorCount++;
        }

        // Pequena pausa entre Linktrees
        console.log('Aguardando 1 segundo antes do próximo link...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`\n=== RESUMO ===`);
      console.log(`Crawler concluído: ${successCount} Linktrees processados, ${errorCount} erros, ${totalProperties} propriedades salvas`);

    } catch (error) {
      console.error('Erro geral no crawler:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    }
  }
}

async function testCrawler() {
  try {
    console.log('🧪 Testando crawler diretamente...');
    console.log('📡 Conectando ao Firebase...');
    
    const crawler = new PropertyCrawler();
    await crawler.runCrawler();
    
    console.log('✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Executar o teste
testCrawler();
