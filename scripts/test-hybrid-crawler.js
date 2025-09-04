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

// Versão JavaScript do crawler híbrido
class HybridCrawler {
  constructor() {
    this.adminDb = db;
  }

  async fetchWithTimeout(url, timeout = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
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
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  isGoogleDriveUrl(url) {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  }

  detectFileType(url, html) {
    const lowerUrl = url.toLowerCase();
    const lowerHtml = html.toLowerCase();
    
    if (lowerUrl.includes('/pdf') || lowerUrl.includes('pdf') || lowerHtml.includes('pdf') || lowerHtml.includes('application/pdf')) {
      return 'pdf';
    }
    
    if (lowerUrl.includes('/document') || lowerUrl.includes('docs.google.com/document') || lowerHtml.includes('google docs')) {
      return 'google-doc';
    }
    
    if (lowerUrl.includes('/spreadsheets') || lowerUrl.includes('sheets.google.com') || lowerHtml.includes('google sheets')) {
      return 'google-sheet';
    }
    
    if (lowerUrl.includes('/presentation') || lowerUrl.includes('slides.google.com') || lowerHtml.includes('google slides')) {
      return 'google-slide';
    }
    
    return 'unknown';
  }

  extractTextFromHTML(html) {
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
      .trim();
    
    return text;
  }

  async extractFromPDF(url, html) {
    console.log('Processando PDF...');
    
    const textContent = this.extractTextFromHTML(html);
    const extractedData = {};
    
    if (textContent) {
      console.log(`Texto extraído do PDF (${textContent.length} caracteres)`);
      
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
      ];
      
      for (const pattern of pricePatterns) {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          const priceStr = match[1].replace(/\./g, '').replace(',', '.');
          const price = parseFloat(priceStr);
          if (!isNaN(price) && price > 0 && price < 10000000) { // Limite de 10 milhões
            extractedData.price = price;
            console.log(`Preço extraído: R$ ${price}`);
            break;
          }
        }
        if (extractedData.price) break;
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
      ];
      
      for (const pattern of areaPatterns) {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          const area = parseInt(match[1]);
          if (!isNaN(area) && area > 0 && area < 10000) {
            extractedData.area = area;
            console.log(`Área extraída: ${area} m²`);
            break;
          }
        }
        if (extractedData.area) break;
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
      ];
      
      for (const pattern of bedroomPatterns) {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          const text = match[1]?.toLowerCase() || '';
          if (text.includes('quarto') || text.includes('dormitório') || text.includes('suite')) {
            // Extrair número de quartos do texto da tipologia
            const numMatch = text.match(/(\d+)/);
            if (numMatch) {
              const bedrooms = parseInt(numMatch[1]);
              if (!isNaN(bedrooms) && bedrooms > 0 && bedrooms < 20) {
                extractedData.bedrooms = bedrooms;
                console.log(`Quartos extraídos: ${bedrooms}`);
                break;
              }
            }
          }
        }
        if (extractedData.bedrooms) break;
      }

      // Extrair banheiros
      const bathroomPatterns = [
        /(\d+)\s*banheiro/gi,
        /(\d+)\s*wc/gi,
        /(\d+)\s*bathroom/gi,
        /banheiro[:\s]*(\d+)/gi,
        /wc[:\s]*(\d+)/gi,
        /bathroom[:\s]*(\d+)/gi
      ];
      
      for (const pattern of bathroomPatterns) {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          const bathrooms = parseInt(match[1]);
          if (!isNaN(bathrooms) && bathrooms > 0 && bathrooms < 20) {
            extractedData.bathrooms = bathrooms;
            console.log(`Banheiros extraídos: ${bathrooms}`);
            break;
          }
        }
        if (extractedData.bathrooms) break;
      }

      // Extrair vagas de estacionamento
      const parkingPatterns = [
        /(\d+)\s*vaga/gi,
        /(\d+)\s*garagem/gi,
        /(\d+)\s*parking/gi,
        /vaga[:\s]*(\d+)/gi,
        /garagem[:\s]*(\d+)/gi,
        /parking[:\s]*(\d+)/gi
      ];
      
      for (const pattern of parkingPatterns) {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          const parking = parseInt(match[1]);
          if (!isNaN(parking) && parking >= 0 && parking < 20) {
            extractedData.parking = parking;
            console.log(`Vagas extraídas: ${parking}`);
            break;
          }
        }
        if (extractedData.parking) break;
      }

      // Determinar tipo de imóvel
      const typeKeywords = {
        apartment: ['apartamento', 'apto', 'flat', 'studio', 'residencial', 'cobertura', 'townhouse'],
        house: ['casa', 'sobrado', 'bangalô', 'mansão', 'residência', 'vila'],
        commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório', 'office', 'loft'],
        land: ['terreno', 'lote', 'chácara', 'sítio', 'fazenda', 'área']
      };

      const lowerText = textContent.toLowerCase();
      for (const [type, keywords] of Object.entries(typeKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          extractedData.type = type;
          console.log(`Tipo de imóvel detectado: ${type}`);
          break;
        }
      }

      // Determinar status do imóvel
      if (lowerText.includes('lançamento') || lowerText.includes('construção') || lowerText.includes('obra') || lowerText.includes('em obras')) {
        extractedData.status = 'construction';
      } else if (lowerText.includes('pronto') || lowerText.includes('ready') || lowerText.includes('pronto para morar')) {
        extractedData.status = 'available';
      } else {
        extractedData.status = 'available';
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
      ];

      for (const pattern of addressPatterns) {
        let match;
        while ((match = pattern.exec(textContent)) !== null) {
          const address = match[1].trim();
          if (address.length > 10 && address.length < 200) {
            const addressComponents = this.parseAddress(address);
            extractedData.address = {
              ...addressComponents,
              country: 'Brasil'
            };
            console.log(`Endereço extraído:`, addressComponents);
            break;
          }
        }
        if (extractedData.address) break;
      }

      // Extrair características
      const featureKeywords = [
        'piscina', 'academia', 'playground', 'churrasqueira', 'elevador', 'portaria',
        'ar condicionado', 'sacada', 'jardim', 'suite', 'mobiliado', 'novo',
        'residencial', 'lançamento', 'pronto para morar', 'em construção',
        'segurança 24h', 'porteiro', 'área de lazer', 'quadra', 'sala de festas',
        'vista para o mar', 'vista para a montanha', 'vista panorâmica'
      ];
      const features = [];
      
      for (const keyword of featureKeywords) {
        if (lowerText.includes(keyword)) {
          features.push(keyword);
        }
      }
      
      if (features.length > 0) {
        extractedData.features = features;
        console.log(`Características extraídas:`, features);
      }
    }
    
    return extractedData;
  }

  async extractFromGenericDocument(html) {
    // Extrair dados genéricos de documentos
    const extractedData = {};
    
    // Extrair preços
    const pricePatterns = [
      /R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*mil/gi,
      /preço[:\s]*R\$\s*([\d.,]+)/gi,
      /valor[:\s]*R\$\s*([\d.,]+)/gi
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.');
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0) {
          extractedData.price = price;
          break;
        }
      }
    }

    // Extrair área
    const areaPatterns = [
      /(\d+)\s*m²/gi,
      /(\d+)\s*metros\s*quadrados/gi,
      /(\d+)\s*m2/gi
    ];
    
    for (const pattern of areaPatterns) {
      const match = html.match(pattern);
      if (match) {
        const area = parseInt(match[1]);
        if (!isNaN(area) && area > 0 && area < 10000) {
          extractedData.area = area;
          break;
        }
      }
    }

    return extractedData;
  }

  isValidPropertyLink(url) {
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
    
    // Padrões melhorados para extrair links do Linktree
    const linkPatterns = [
      /<a[^>]*href="([^"]*)"[^>]*>/gi,
      /href="([^"]*)"[^>]*>/gi,
      /"url":"([^"]*)"/gi,
      /"href":"([^"]*)"/gi,
      /href='([^']*)'/gi,
      /<link[^>]*href="([^"]*)"[^>]*>/gi
    ];
    
    for (const pattern of linkPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        if (url && this.isValidPropertyLink(url)) {
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

  async extractImagesFromHTML(html, baseUrl) {
    const images = [];
    
    // Padrões para extrair imagens
    const imgPatterns = [
      /<img[^>]*src="([^"]+)"[^>]*>/gi,
      /<img[^>]*src='([^']+)'[^>]*>/gi,
      /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /background:\s*url\(['"]?([^'")\s]+)['"]?\)/gi,
      /src="([^"]*\.(?:jpg|jpeg|png|gif|webp))"/gi,
      /src='([^']*\.(?:jpg|jpeg|png|gif|webp))'/gi
    ];
    
    for (const pattern of imgPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const imageUrl = match[1];
        if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.includes('logo') && !imageUrl.includes('icon')) {
          try {
            const absoluteUrl = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, baseUrl).href;
            if (this.isValidImageUrl(absoluteUrl)) {
              images.push(absoluteUrl);
            }
          } catch (error) {
            console.log(`URL de imagem inválida: ${imageUrl}`);
          }
        }
      }
    }
    
    // Remover duplicatas e limitar a 10 imagens
    return Array.from(new Set(images)).slice(0, 10);
  }

  isValidImageUrl(url) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    
    // Verificar se tem extensão de imagem
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return true;
    }
    
    // Verificar se parece ser uma URL de imagem (sem parâmetros estranhos)
    if (lowerUrl.includes('image') || lowerUrl.includes('img') || lowerUrl.includes('photo')) {
      return true;
    }
    
    return false;
  }

  async extractFromHTML(html, url) {
    const property = {
      sourceUrl: url
    };

    // Extrair título com mais padrões
    const titlePatterns = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<h2[^>]*>([^<]+)<\/h2>/i,
      /class="[^"]*title[^"]*"[^>]*>([^<]+)</i,
      /id="[^"]*title[^"]*"[^>]*>([^<]+)</i
    ];
    
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match) {
        const title = match[1].trim();
        if (title.length > 3 && title.length < 200) {
          property.title = title;
          break;
        }
      }
    }

    // Extrair descrição com mais padrões
    const descPatterns = [
      /<meta[^>]*name="description"[^>]*content="([^"]+)"/i,
      /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i,
      /<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</i,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</i
    ];
    
    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match) {
        const description = match[1].trim();
        if (description.length > 10 && description.length < 500) {
          property.description = description;
          break;
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
    ];
    
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.');
        const price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0) {
          property.price = price;
          break;
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
    ];
    
    for (const pattern of areaPatterns) {
      const match = html.match(pattern);
      if (match) {
        const area = parseInt(match[1]);
        if (!isNaN(area) && area > 0 && area < 10000) {
          property.area = area;
          break;
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
    ];
    
    for (const pattern of bedroomPatterns) {
      const match = html.match(pattern);
      if (match) {
        const bedrooms = parseInt(match[1]);
        if (!isNaN(bedrooms) && bedrooms > 0 && bedrooms < 20) {
          property.bedrooms = bedrooms;
          break;
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
    ];
    
    for (const pattern of bathroomPatterns) {
      const match = html.match(pattern);
      if (match) {
        const bathrooms = parseInt(match[1]);
        if (!isNaN(bathrooms) && bathrooms > 0 && bathrooms < 20) {
          property.bathrooms = bathrooms;
          break;
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
    ];
    
    for (const pattern of parkingPatterns) {
      const match = html.match(pattern);
      if (match) {
        const parking = parseInt(match[1]);
        if (!isNaN(parking) && parking >= 0 && parking < 20) {
          property.parking = parking;
          break;
        }
      }
    }

    // Determinar tipo de imóvel com mais precisão
    const typeKeywords = {
      apartment: ['apartamento', 'apto', 'flat', 'studio', 'residencial', 'cobertura'],
      house: ['casa', 'sobrado', 'bangalô', 'mansão', 'residência', 'vila'],
      commercial: ['comercial', 'loja', 'galpão', 'sala', 'escritório', 'office', 'loft'],
      land: ['terreno', 'lote', 'chácara', 'sítio', 'fazenda', 'área']
    };

    const lowerHtml = html.toLowerCase();
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => lowerHtml.includes(keyword))) {
        property.type = type;
        break;
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
    ];

    for (const pattern of addressPatterns) {
      const match = html.match(pattern);
      if (match) {
        const address = match[1].trim();
        if (address.length > 10 && address.length < 200) {
          // Tentar extrair componentes do endereço
          const addressComponents = this.parseAddress(address);
          property.address = {
            ...addressComponents,
            country: 'Brasil'
          };
          break;
        }
      }
    }

    // Extrair métodos de pagamento
    const paymentKeywords = ['financiamento', 'entrada', 'parcelado', 'à vista', 'consórcio', 'leasing', 'permuta'];
    const paymentMethods = [];
    
    for (const keyword of paymentKeywords) {
      if (lowerHtml.includes(keyword)) {
        paymentMethods.push(keyword);
      }
    }
    
    if (paymentMethods.length > 0) {
      property.paymentMethods = paymentMethods;
    }

    // Extrair características com mais opções
    const featureKeywords = [
      'piscina', 'academia', 'playground', 'churrasqueira', 'elevador', 'portaria',
      'ar condicionado', 'sacada', 'jardim', 'suite', 'mobiliado', 'novo',
      'residencial', 'lançamento', 'pronto para morar', 'em construção',
      'segurança 24h', 'porteiro', 'área de lazer', 'quadra', 'sala de festas'
    ];
    const features = [];
    
    for (const keyword of featureKeywords) {
      if (lowerHtml.includes(keyword)) {
        features.push(keyword);
      }
    }
    
    if (features.length > 0) {
      property.features = features;
    }

    // Extrair imagens usando o método melhorado
    property.images = await this.extractImagesFromHTML(html, url);

    return property;
  }

  parseAddress(address) {
    const addressObj = {};
    
    // Padrões para extrair cidade e estado
    const cityStatePatterns = [
      /([^,]+),\s*([A-Z]{2})/i,
      /([^,]+)\s*-\s*([A-Z]{2})/i,
      /em\s+([^,]+),\s*([A-Z]{2})/i
    ];
    
    for (const pattern of cityStatePatterns) {
      const match = address.match(pattern);
      if (match) {
        addressObj.city = match[1].trim();
        addressObj.state = match[2].trim();
        break;
      }
    }
    
    // Se não conseguiu extrair cidade/estado, usar o endereço completo
    if (!addressObj.city) {
      addressObj.street = address;
    }
    
    return addressObj;
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
      
      console.log(`Encontrados ${propertyLinks.length} links de propriedades no Linktree`);
      
      const properties = [];
      
      // Separar links normais de links do Google Drive
      const normalLinks = [];
      const googleDriveLinks = [];
      
      for (const url of propertyLinks) {
        if (this.isGoogleDriveUrl(url)) {
          googleDriveLinks.push(url);
        } else {
          normalLinks.push(url);
        }
      }
      
      console.log(`Links normais: ${normalLinks.length}, Links Google Drive: ${googleDriveLinks.length}`);
      
      // Processar links normais
      for (const propertyUrl of normalLinks) {
        try {
          console.log(`Processando propriedade normal: ${propertyUrl}`);
          
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
          };
          
          properties.push(property);
          
          // Pequena pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Erro ao processar propriedade ${propertyUrl}:`, error);
        }
      }
      
      // Processar links do Google Drive (processamento real)
      if (googleDriveLinks.length > 0) {
        console.log(`Processando ${googleDriveLinks.length} arquivos do Google Drive...`);
        
        for (const driveUrl of googleDriveLinks) {
          try {
            console.log(`Processando arquivo do Google Drive: ${driveUrl}`);
            
            // Fazer request para o arquivo do Google Drive
            const driveResponse = await this.fetchWithTimeout(driveUrl, 20000);
            if (!driveResponse.ok) {
              console.log(`Erro ao acessar arquivo do Google Drive ${driveUrl}: ${driveResponse.status}`);
              continue;
            }
            
            const driveHtml = await driveResponse.text();
            
            // Detectar tipo de arquivo
            const fileType = this.detectFileType(driveUrl, driveHtml);
            console.log(`Tipo de arquivo detectado: ${fileType}`);
            
            // Extrair dados baseado no tipo
            let extractedData = {};
            
            if (fileType === 'pdf') {
              extractedData = await this.extractFromPDF(driveUrl, driveHtml);
            } else {
              extractedData = await this.extractFromGenericDocument(driveHtml);
            }
            
            // Criar propriedade com dados extraídos
            const property = {
              title: extractedData.title || `Documento Google Drive - ${driveUrl.split('/').pop()}`,
              description: extractedData.description || 'Documento do Google Drive processado',
              price: extractedData.price || null,
              area: extractedData.area || null,
              bedrooms: extractedData.bedrooms || null,
              bathrooms: extractedData.bathrooms || null,
              parking: extractedData.parking || null,
              address: extractedData.address || { country: 'Brasil' },
              type: extractedData.type || 'apartment',
              status: extractedData.status || 'available',
              paymentMethods: [],
              features: extractedData.features || ['documento digital'],
              images: extractedData.images || [],
              documents: [driveUrl],
              sourceUrl: driveUrl,
              sourceId: linkData.id
            };
            
            properties.push(property);
            console.log(`Propriedade do Google Drive criada: ${property.title}`);
            
            // Pausa entre processamentos
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.error(`Erro ao processar arquivo do Google Drive ${driveUrl}:`, error);
          }
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
    };

    try {
      const docRef = await this.adminDb.collection('properties_raw').add(propertyData);
      console.log(`Propriedade salva: ${docRef.id} - ${propertyData.title}`);
      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar propriedade:', error);
      throw error;
    }
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
    console.log('Iniciando crawler híbrido de propriedades...');
    
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
        console.log('Aguardando 2 segundos antes do próximo link...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`\n=== RESUMO ===`);
      console.log(`Crawler híbrido concluído: ${successCount} Linktrees processados, ${errorCount} erros, ${totalProperties} propriedades salvas`);

    } catch (error) {
      console.error('Erro geral no crawler híbrido:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    }
  }
}

async function testHybridCrawler() {
  try {
    console.log('🧪 Testando crawler híbrido diretamente...');
    console.log('📡 Conectando ao Firebase...');
    
    const crawler = new HybridCrawler();
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
testHybridCrawler();
