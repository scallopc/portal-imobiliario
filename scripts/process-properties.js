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

class PropertyProcessor {
  constructor() {
    this.adminDb = db;
  }

  // Função para fazer upload de imagem para Cloudinary
  async uploadImageToCloudinary(imageUrl) {
    try {
      // Aqui você implementaria a integração com Cloudinary
      // Por enquanto, vou retornar a URL original
      // Em produção, você faria:
      // const result = await cloudinary.uploader.upload(imageUrl, {
      //   format: 'webp',
      //   transformation: [{ width: 800, height: 600, crop: 'fill' }]
      // });
      // return result.secure_url;
      
      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload para Cloudinary:', error);
      return null;
    }
  }

  // Extrair imagens dos dados brutos
  extractImagesFromRawData(rawData) {
    const images = [];
    
    if (!rawData) return images;
    
    // Se já tem imagens no rawData, usar elas
    if (rawData.images && Array.isArray(rawData.images)) {
      images.push(...rawData.images);
    }
    
    // Se tem extractedData com imagens
    if (rawData.extractedData && rawData.extractedData.images && Array.isArray(rawData.extractedData.images)) {
      images.push(...rawData.extractedData.images);
    }
    
    // Se tem HTML, extrair imagens do HTML
    if (rawData.html) {
      const htmlImages = this.extractImagesFromHTML(rawData.html);
      images.push(...htmlImages);
    }
    
    // Remover duplicatas e URLs inválidas
    const uniqueImages = [...new Set(images)].filter(url => 
      url && typeof url === 'string' && url.startsWith('http')
    );
    
    return uniqueImages.slice(0, 10); // Limitar a 10 imagens
  }
  
  // Extrair imagens do HTML
  extractImagesFromHTML(html) {
    const images = [];
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
      const imageUrl = match[1];
      if (imageUrl && !imageUrl.startsWith('data:') && imageUrl.startsWith('http')) {
        images.push(imageUrl);
      }
    }
    
    return images;
  }

  // Remover nomes de construtoras e palavras desnecessárias
  cleanTitle(title) {
    if (!title) return '';
    
    // Palavras para remover
    const wordsToRemove = [
      'google drive', 'drive', 'tabela', 'tabelas', 'vendas', 'venda',
      'apresentação', 'apresentações', 'ficha', 'técnica', 'plantas',
      'imagens', 'video', 'book', 'digital', 'aplicativo', 'ios', 'android',
      'materiais', 'corretores', 'arquivos', 'úteis', 'pdf', 'canal',
      'disponibilidade', 'produtos', 'brix', 'mozak', 'even', 'blanc',
      'nurban', 'zenture', 'patrimar', 'patrimóvel', 'grupo', 'santa', 'isabel',
      'mrv', 'imob', 'rj', 'cyrela', 'cia', 'w3', 'construtora', 'gafisa',
      'stanti', 'bothanica', 'urbanismo', 'novolar', 'parcerias', 'tegra',
      'conecta', 'b', 'unique', 'barrinha', 'residence', 'inti', 'canopus',
      'construtora', 'tao', 'empreendimentos', 'avanco', 'sal', 'residencial',
      'amarear', 'poador', 'imoveis', 'descontos', 'canopus', 'construtora'
    ];
    
    let cleanTitle = title.toLowerCase();
    
    // Remover palavras específicas
    for (const word of wordsToRemove) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanTitle = cleanTitle.replace(regex, '');
    }
    
    // Limpar espaços extras e caracteres especiais
    cleanTitle = cleanTitle
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .trim();
    
    // Capitalizar primeira letra
    return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  }

  // Determinar se é realmente um imóvel baseado no conteúdo
  isPropertyRelated(title, description, url) {
    const text = `${title} ${description}`.toLowerCase();
    
    // Se o título contém APENAS palavras não relacionadas a imóveis, ignorar
    const excludeOnlyKeywords = [
      'armra', 'omnilux', 'ritual', 'headspace', 'equip', 'clearstem',
      'daily harvest', 'gobble', 'maev', 'zero proof', 'jlab', 'talkspace',
      'babbel', 'thanks', 'offer', 'not', 'available', 'search', 'aaa',
      'membership', 'earn', 'shop', 'gas', 'grocery', 'food', 'upside',
      'junix', 'plataforma', 'mental health', 'therapy', 'psychiatry'
    ];
    
    // Verificar se contém palavras relacionadas a imóveis
    if (this.hasPropertyKeywords(text)) {
      return true;
    }
    
    // Verificar se é um documento do Google Drive que pode ser um imóvel
    if (url && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
      // Se o título contém palavras que sugerem ser um imóvel, processar
      const propertyIndicators = [
        'obra', 'construção', 'torre', 'residencial', 'apartamento', 'casa',
        'empreendimento', 'imobiliário', 'imóvel', 'residência', 'condomínio',
        'tower', 'residence', 'building', 'project', 'development'
      ];
      
      if (propertyIndicators.some(indicator => text.includes(indicator))) {
        return true;
      }
    }
    
    // Se contém APENAS palavras de exclusão E não tem indicadores de imóvel, ignorar
    if (excludeOnlyKeywords.some(keyword => text.includes(keyword))) {
      return false;
    }
    
    // Por padrão, processar se não for claramente algo não relacionado
    return true;
  }
  
  // Verificar se tem palavras-chave de imóveis
  hasPropertyKeywords(text) {
    const propertyKeywords = [
      'apartamento', 'casa', 'imóvel', 'terreno', 'comercial', 'residencial',
      'quarto', 'banheiro', 'cozinha', 'sala', 'varanda', 'suite',
      'venda', 'aluguel', 'alugar', 'comprar', 'financiamento', 'lançamento',
      'm²', 'metros', 'área', 'preço', 'valor', 'dormitório', 'suíte',
      'sacada', 'jardim', 'piscina', 'academia', 'elevador', 'portaria',
      'estacionamento', 'vaga', 'mobiliado', 'novo', 'pronto', 'construção',
      'residence', 'residencial', 'clube', 'design', 'park', 'atmosfera',
      'horizon', 'signature', 'collection', 'art', 'rio mar', 'portinari',
      'now plus', 'boutique', 'arouca', 'frade', 'gabizo', 'hum', 'h.u.m',
      'jardim pindorama', 'boulevard', 'offices', 'faces', 'arte botânica',
      'atmosfera tijuca', 'canal even', 'ox park', 'b unique', 'barrinha',
      // Novas palavras-chave para Google Drive
      'obra', 'torre', 'empreendimento', 'imobiliário', 'residência', 'condomínio',
      'tower', 'building', 'project', 'development', 'residential', 'apartment',
      'house', 'commercial', 'land', 'construction', 'obra', 'construção',
      'andamento', 'status', 'progresso', 'ficha técnica', 'plantas', 'especificações'
    ];
    
    return propertyKeywords.some(keyword => text.includes(keyword));
  }

  // Extrair informações detalhadas do imóvel
  extractPropertyInfo(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    // Extrair número de quartos/dormitórios com padrões mais específicos para tabelas
    const bedroomPatterns = [
      /(\d+)\s*(?:quarto|dormitório|bedroom|bed)/i,
      /(?:quarto|dormitório|bedroom|bed)\s*(\d+)/i,
      /(\d+)\s*qts?/i,  // Para "3qts", "4qts"
      /(\d+)\s*quartos?/i,
      /tipologia[:\s]*(\d+)/i,
      /tipo[:\s]*(\d+)/i
    ];
    let bedrooms = null;
    for (const pattern of bedroomPatterns) {
      const match = text.match(pattern);
      if (match) {
        bedrooms = parseInt(match[1]);
        break;
      }
    }
    
    // Extrair número de banheiros
    const bathroomPatterns = [
      /(\d+)\s*(?:banheiro|bathroom|bath)/i,
      /(?:banheiro|bathroom|bath)\s*(\d+)/i
    ];
    let bathrooms = null;
    for (const pattern of bathroomPatterns) {
      const match = text.match(pattern);
      if (match) {
        bathrooms = parseInt(match[1]);
        break;
      }
    }
    
    // Se não encontrou banheiros, estimar baseado nos quartos
    if (!bathrooms && bedrooms) {
      bathrooms = bedrooms >= 3 ? 2 : 1;
    }
    
    // Extrair área com padrões mais específicos para tabelas
    const areaPatterns = [
      /(\d+)\s*m²/i,
      /(\d+)\s*metros\s*quadrados/i,
      /área[:\s]*(\d+)/i,
      /m²[:\s]*(\d+)/i,
      /metros[:\s]*(\d+)/i,
      /(\d+)\s*m2/i,
      /(\d+)\s*sqm/i
    ];
    let area = null;
    for (const pattern of areaPatterns) {
      const match = text.match(pattern);
      if (match) {
        area = parseFloat(match[1].replace(',', '.'));
        if (area > 0 && area < 10000) break; // Validação de área razoável
      }
    }
    
    // Extrair preço com padrões mais específicos para tabelas
    const pricePatterns = [
      /R\$\s*([\d.,]+)/gi,
      /R\$\s*([\d.,]+)\s*mil/gi,
      /preço[:\s]*R\$\s*([\d.,]+)/gi,
      /valor[:\s]*R\$\s*([\d.,]+)/gi,
      /por[:\s]*R\$\s*([\d.,]+)/gi,
      /de[:\s]*R\$\s*([\d.,]+)/gi,
      /([\d.,]+)\s*reais/gi,
      /([\d.,]+)\s*R\$/gi
    ];
    let price = null;
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/\./g, '').replace(',', '.');
        price = parseFloat(priceStr);
        if (!isNaN(price) && price > 0 && price < 10000000) break; // Validação de preço razoável
      }
    }
    
    // Extrair vagas de estacionamento com padrões mais específicos
    const parkingPatterns = [
      /(\d+)\s*(?:vaga|parking|garage)/i,
      /(\d+)\s*dupla/i,
      /(\d+)\s*simples/i,
      /vaga[:\s]*(\d+)/i,
      /garagem[:\s]*(\d+)/i
    ];
    let parking = null;
    for (const pattern of parkingPatterns) {
      const match = text.match(pattern);
      if (match) {
        parking = parseInt(match[1]);
        break;
      }
    }
    
    // Determinar se é mobiliado
    const furnished = text.includes('mobiliado') || text.includes('furnished');
    
         // Determinar tipo de imóvel
     let type = 'apartamento';
     if (text.includes('casa') || text.includes('house')) type = 'casa';
     else if (text.includes('comercial') || text.includes('commercial')) type = 'comercial';
     else if (text.includes('terreno') || text.includes('land')) type = 'terreno';
     
     // Determinar status
     let status = 'disponível';
     if (text.includes('lançamento') || text.includes('construção')) status = 'em construção';
     else if (text.includes('pronto') || text.includes('ready')) status = 'pronto para morar';
    
    // Extrair características
    const features = [];
    if (text.includes('ar condicionado') || text.includes('air conditioning')) features.push('Ar Condicionado');
    if (text.includes('elevador') || text.includes('elevator')) features.push('Elevador');
    if (text.includes('piscina') || text.includes('pool')) features.push('Piscina');
    if (text.includes('academia') || text.includes('gym')) features.push('Academia');
    if (text.includes('segurança') || text.includes('security')) features.push('Segurança 24h');
    if (text.includes('porteiro') || text.includes('concierge')) features.push('Porteiro');
    if (text.includes('sacada') || text.includes('balcony')) features.push('Sacada');
    if (text.includes('jardim') || text.includes('garden')) features.push('Jardim');
    if (text.includes('suite') || text.includes('suíte')) features.push('Suíte');
    
    return {
      bedrooms,
      bathrooms,
      area,
      price,
      parking,
      furnished,
      type,
      status,
      features
    };
  }

  // Gerar título atrativo baseado nas informações
  generateAttractiveTitle(extractedInfo, originalTitle) {
    const parts = [];
    
    if (extractedInfo.bedrooms) {
      parts.push(`${extractedInfo.bedrooms} quarto${extractedInfo.bedrooms > 1 ? 's' : ''}`);
    }
    
    if (extractedInfo.area) {
      parts.push(`${extractedInfo.area}m²`);
    }
    
         if (extractedInfo.type === 'casa') {
       parts.push('Casa');
     } else if (extractedInfo.type === 'comercial') {
       parts.push('Imóvel Comercial');
     } else if (extractedInfo.type === 'terreno') {
       parts.push('Terreno');
     } else {
       parts.push('Apartamento');
     }
     
     if (extractedInfo.status === 'em construção') {
       parts.push('em Construção');
     } else if (extractedInfo.status === 'pronto para morar') {
       parts.push('Pronto para Morar');
     }
    
    if (parts.length > 0) {
      return parts.join(' - ');
    }
    
    // Fallback: limpar o título original
    return this.cleanTitle(originalTitle) || 'Imóvel Disponível';
  }

  // Processar uma propriedade individual
  async processProperty(rawProperty) {
    try {
      console.log(`Processando: ${rawProperty.title}`);
      
      // Verificar se é realmente um imóvel
      if (!this.isPropertyRelated(rawProperty.title, rawProperty.description, rawProperty.sourceUrl)) {
        console.log(`Não é um imóvel: ${rawProperty.title}`);
        return null;
      }
      
             // Extrair informações detalhadas
       const extractedInfo = this.extractPropertyInfo(
         rawProperty.title, 
         rawProperty.description
       );
      
             // Se não conseguiu extrair informações básicas, mas parece ser um imóvel, processar mesmo assim
       if (!extractedInfo.bedrooms && !extractedInfo.area && !extractedInfo.price) {
         console.log(`Informações básicas não extraídas, mas processando: ${rawProperty.title}`);
         // Continuar o processamento mesmo sem informações detalhadas
       }
      
             // Gerar título atrativo
       const attractiveTitle = this.generateAttractiveTitle(extractedInfo, rawProperty.title);
       
       // Extrair imagens dos dados brutos
       const images = this.extractImagesFromRawData(rawProperty.rawData);
       
       // Gerar código único
       const code = await this.generatePropertyCode();
       
              // Criar propriedade processada
       const processedProperty = {
         // Código único
         code: code,
         // Campos básicos
         title: attractiveTitle,
        description: extractedInfo.features.length > 0 
          ? `Imóvel com ${extractedInfo.features.join(', ').toLowerCase()}. ${rawProperty.description || ''}`
          : rawProperty.description || 'Imóvel disponível para venda ou aluguel.',
        price: extractedInfo.price,
        area: extractedInfo.area,
        
        // Endereço (será preenchido depois)
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
        type: extractedInfo.type,
        status: extractedInfo.status,
        bedrooms: extractedInfo.bedrooms,
        bathrooms: extractedInfo.bathrooms,
        parking: extractedInfo.parking,
        furnished: extractedInfo.furnished,
        
        // Características
        features: extractedInfo.features,
        amenities: [],
        images: images,
        
        // Metadados
        sourceUrl: rawProperty.sourceUrl,
        sourceId: rawProperty.sourceId,
        isActive: true,
        views: 0,
        favorites: 0,
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Campos de controle
        processedAt: new Date(),
        originalId: rawProperty.id
      };
      
      return processedProperty;
      
    } catch (error) {
      console.error(`Erro ao processar propriedade ${rawProperty.title}:`, error);
      return null;
    }
  }

  // Gerar código único para o imóvel
  async generatePropertyCode() {
    try {
      // Buscar o último código na coleção properties
      const lastPropertySnapshot = await this.adminDb.collection('properties')
        .orderBy('code', 'desc')
        .limit(1)
        .get();
      
      let nextNumber = 1;
      
      if (!lastPropertySnapshot.empty) {
        const lastProperty = lastPropertySnapshot.docs[0].data();
        if (lastProperty.code && lastProperty.code.startsWith('P-')) {
          const lastNumber = parseInt(lastProperty.code.substring(2));
          nextNumber = lastNumber + 1;
        }
      }
      
      return `P-${nextNumber.toString().padStart(5, "0")}`;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      // Fallback: usar timestamp
      return `P-${Date.now().toString().slice(-5)}`;
    }
  }

  // Processar todas as propriedades brutas
  async processAllProperties() {
    console.log('🔄 Iniciando processamento de propriedades...');
    
    try {
      // Buscar propriedades brutas que precisam de processamento
      const rawPropertiesSnapshot = await this.adminDb.collection('properties_raw')
        .where('needsProcessing', '==', true)
        .where('processingStatus', '==', 'pending')
        .limit(50)
        .get();

      if (rawPropertiesSnapshot.empty) {
        console.log('Nenhuma propriedade bruta encontrada para processamento');
        return;
      }

      console.log(`Encontradas ${rawPropertiesSnapshot.size} propriedades para processar`);

      let processedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const doc of rawPropertiesSnapshot.docs) {
        try {
          const rawProperty = { id: doc.id, ...doc.data() };
          
          // Marcar como processando
          await doc.ref.update({
            processingStatus: 'processing',
            processingStartedAt: new Date()
          });

          // Processar a propriedade
          const processedProperty = await this.processProperty(rawProperty);
          
          if (processedProperty) {
            // Salvar na coleção principal
            const newDocRef = await this.adminDb.collection('properties').add(processedProperty);
            
            // Marcar como processado
            await doc.ref.update({
              processingStatus: 'completed',
              processedAt: new Date(),
              processedPropertyId: newDocRef.id
            });
            
            console.log(`✅ Processado: ${processedProperty.title} -> ${newDocRef.id}`);
            processedCount++;
          } else {
            // Marcar como ignorado
            await doc.ref.update({
              processingStatus: 'ignored',
              processedAt: new Date(),
              ignoreReason: 'Não é um imóvel válido'
            });
            
            console.log(`⏭️ Ignorado: ${rawProperty.title}`);
            skippedCount++;
          }

        } catch (error) {
          console.error(`❌ Erro ao processar ${doc.id}:`, error);
          
          // Marcar como erro
          await doc.ref.update({
            processingStatus: 'error',
            processedAt: new Date(),
            error: error.message
          });
          
          errorCount++;
        }

        // Pequena pausa entre processamentos
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`\n=== RESUMO DO PROCESSAMENTO ===`);
      console.log(`Processados: ${processedCount}`);
      console.log(`Ignorados: ${skippedCount}`);
      console.log(`Erros: ${errorCount}`);
      console.log(`Total: ${rawPropertiesSnapshot.size}`);

    } catch (error) {
      console.error('Erro geral no processamento:', error);
    }
  }
}

async function processProperties() {
  try {
    console.log('🧪 Iniciando processamento de propriedades...');
    
    const processor = new PropertyProcessor();
    await processor.processAllProperties();
    
    console.log('✅ Processamento concluído!');
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

// Executar o processamento
processProperties();
