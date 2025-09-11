// Processador de dados brutos para refinar e salvar em properties
require('dotenv').config()

const admin = require('firebase-admin')
const { GoogleGenerativeAI } = require('@google/generative-ai')

// Configurar Firebase Admin
if (!admin.apps.length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let projectId, clientEmail, privateKey;

  if (svcJson) {
    const parsed = JSON.parse(svcJson);
    projectId = parsed.project_id;
    clientEmail = parsed.client_email;
    privateKey = (parsed.private_key || '').replace(/\\n/g, "\n");
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const db = admin.firestore()

// Verificar se a chave da API Gemini está configurada
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não configurada no arquivo .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class PropertyProcessor {
  constructor() {
    this.adminDb = db;
    this.genAI = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Buscar propriedades não processadas
  async getUnprocessedProperties() {
    try {
      const propertiesSnapshot = await this.adminDb.collection('properties_raw')
        .where('needsProcessing', '==', true)
        .where('processingStatus', '==', 'pending')
        .limit(20)
        .get();

      if (propertiesSnapshot.empty) {
        console.log('⚠️ Nenhuma propriedade pendente encontrada');
        return [];
      }

      const properties = [];
      propertiesSnapshot.docs.forEach(doc => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`📋 Encontradas ${properties.length} propriedades para processar`);
      return properties;
    } catch (error) {
      console.error('❌ Erro ao buscar propriedades:', error.message);
      return [];
    }
  }

  // Refinar dados com IA
  async refinePropertyWithAI(rawProperty) {
    try {
      const prompt = `
        Refine e melhore os dados deste imóvel, mantendo campos em INGLÊS e valores em PORTUGUÊS:
        
        DADOS ATUAIS:
        ${JSON.stringify(rawProperty, null, 2)}
        
        Tarefas:
        1. Melhorar o título para ser mais atrativo
        2. Enriquecer a descrição com detalhes relevantes
        3. Normalizar e validar todos os campos numéricos
        4. Adicionar características inferidas do contexto
        5. Corrigir inconsistências nos dados
        
        Retorne JSON refinado com a mesma estrutura:
        {
          "neighborhood": "bairro normalizado",
          "type": "apartment|house|penthouse|commercial|land",
          "price": valor_numerico_limpo,
          "area": area_numerica_limpa,
          "bedrooms": numero_quartos,
          "suites": numero_suites,
          "bathrooms": numero_banheiros,
          "parking": numero_vagas,
          "building": "nome do prédio/condomínio",
          "description": "descrição melhorada e detalhada em português",
          "address": "endereço completo normalizado",
          "features": ["lista", "de", "características", "melhoradas"],
          "furnished": true_ou_false,
          "title": "título atrativo melhorado",
          "sourceUrl": "manter URL original"
        }
        
        IMPORTANTE: Retorne APENAS o JSON refinado, sem explicações.
      `;

      const result = await this.genAI.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      try {
        const refinedProperty = JSON.parse(text);
        return refinedProperty;
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON refinado:', parseError.message);
        return rawProperty; // Retorna dados originais se falhar
      }
    } catch (error) {
      console.error('❌ Erro ao refinar com IA:', error.message);
      return rawProperty; // Retorna dados originais se falhar
    }
  }

  // Gerar código único para o imóvel
  async generatePropertyCode() {
    try {
      const lastPropertySnapshot = await this.adminDb.collection('properties')
        .orderBy('code', 'desc')
        .limit(1)
        .get();

      let nextNumber = 1;
      if (!lastPropertySnapshot.empty) {
        const lastCode = lastPropertySnapshot.docs[0].data().code;
        const lastNumber = parseInt(lastCode.replace('IMV', ''));
        nextNumber = lastNumber + 1;
      }

      return `IMV${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error('❌ Erro ao gerar código:', error.message);
      return `IMV${Date.now().toString().slice(-6)}`;
    }
  }

  // Processar uma propriedade individual
  async processProperty(rawProperty) {
    try {
      console.log(`🔄 Processando: ${rawProperty.title || rawProperty.type}`);
      
      // Marcar como processando
      await this.adminDb.collection('properties_raw').doc(rawProperty.id).update({
        processingStatus: 'processing',
        processingStartedAt: new Date()
      });

      // Refinar dados com IA
      const refinedData = await this.refinePropertyWithAI(rawProperty);
      
      // Gerar código único
      const code = await this.generatePropertyCode();
      
      // Criar propriedade processada
      const processedProperty = {
        // Código único
        code: code,
        
        // Dados refinados
        title: refinedData.title,
        description: refinedData.description,
        price: refinedData.price,
        area: refinedData.area,
        
        // Endereço estruturado
        address: {
          street: refinedData.address || '',
          neighborhood: refinedData.neighborhood,
          city: refinedData.neighborhood?.includes('Niterói') ? 'Niterói' : 'Rio de Janeiro',
          state: 'RJ',
          country: 'Brasil',
          zipCode: '',
          latitude: null,
          longitude: null
        },
        
        // Detalhes do imóvel
        type: refinedData.type,
        status: 'available',
        bedrooms: refinedData.bedrooms || 0,
        suites: refinedData.suites || 0,
        bathrooms: refinedData.bathrooms || 0,
        parking: refinedData.parking || 0,
        furnished: refinedData.furnished || false,
        
        // Características
        features: refinedData.features || [],
        amenities: [],
        building: refinedData.building || '',
        
        // Imagens (será preenchido depois)
        images: [],
        
        // Metadados
        sourceUrl: refinedData.sourceUrl,
        source: rawProperty.source,
        site: rawProperty.site,
        isActive: true,
        views: 0,
        favorites: 0,
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        processedAt: new Date(),
        originalId: rawProperty.id
      };

      // Salvar na coleção properties
      const newDocRef = await this.adminDb.collection('properties').add(processedProperty);
      
      // Marcar como processado
      await this.adminDb.collection('properties_raw').doc(rawProperty.id).update({
        processingStatus: 'completed',
        processedAt: new Date(),
        processedPropertyId: newDocRef.id,
        needsProcessing: false
      });
      
      console.log(`✅ Processado: ${processedProperty.title} -> ${newDocRef.id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erro ao processar propriedade:`, error.message);
      
      // Marcar como erro
      await this.adminDb.collection('properties_raw').doc(rawProperty.id).update({
        processingStatus: 'error',
        processedAt: new Date(),
        error: error.message
      });
      
      return false;
    }
  }

  // Executar processador principal
  async run() {
    console.log('🔄 Iniciando processamento de propriedades...\n');
    
    try {
      const properties = await this.getUnprocessedProperties();
      
      if (properties.length === 0) {
        console.log('✅ Nenhuma propriedade pendente para processar');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;
      
      for (const property of properties) {
        const success = await this.processProperty(property);
        if (success) {
          processedCount++;
        } else {
          errorCount++;
        }
        
        // Pausa entre processamentos
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`\n🎉 Processamento finalizado!`);
      console.log(`📊 Resumo:`);
      console.log(`- Propriedades processadas: ${processedCount}`);
      console.log(`- Erros: ${errorCount}`);
      console.log(`- Total: ${properties.length}`);
      
    } catch (error) {
      console.error('❌ Erro geral no processamento:', error);
    }
  }
}

async function main() {
  try {
    const processor = new PropertyProcessor();
    await processor.run();
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PropertyProcessor };
