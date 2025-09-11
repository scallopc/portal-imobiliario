// Processador que envia HTML bruto para IA e extrai dados estruturados
require("dotenv").config();

const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configurar Firebase Admin
if (!admin.apps.length) {
  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let projectId, clientEmail, privateKey;

  if (svcJson) {
    const parsed = JSON.parse(svcJson);
    projectId = parsed.project_id;
    clientEmail = parsed.client_email;
    privateKey = (parsed.private_key || "").replace(/\\n/g, "\n");
  } else {
    projectId = process.env.FIREBASE_PROJECT_ID;
    clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

const db = admin.firestore();

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não configurada no arquivo .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class HtmlProcessor {
  constructor() {
    this.adminDb = db;
    this.genAI = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Buscar HTMLs não processados
  async getUnprocessedHtml() {
    try {
      const htmlSnapshot = await this.adminDb.collection('properties_raw')
        .where('needsProcessing', '==', true)
        .where('processingStatus', '==', 'pending')
        .where('source', '==', 'html_scraper')
        .limit(10)
        .get();

      if (htmlSnapshot.empty) {
        console.log('⚠️ Nenhum HTML pendente encontrado');
        return [];
      }

      const htmlDocs = [];
      htmlSnapshot.docs.forEach(doc => {
        htmlDocs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`📋 Encontrados ${htmlDocs.length} HTMLs para processar`);
      return htmlDocs;
    } catch (error) {
      console.error('❌ Erro ao buscar HTMLs:', error.message);
      return [];
    }
  }

  // Limpar resposta da IA removendo markdown
  cleanAiResponse(text) {
    // Remover blocos de código markdown
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remover quebras de linha extras
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  // Processar HTML com IA
  async processHtmlWithAI(htmlDoc) {
    try {
      // Limitar tamanho do HTML para evitar limite de tokens
      const htmlContent = htmlDoc.rawHtml.substring(0, 15000);
      
      const prompt = `
        Analise este HTML de uma página de imóvel e extraia informações estruturadas.
        
        FOQUE APENAS em imóveis nas seguintes regiões:
        - Rio de Janeiro: Barra da Tijuca, Joá, Itanhangá, Recreio dos Bandeirantes, Camorim, Vargem Grande, Vargem Pequena, Grumari
        - Niterói: Icaraí, Santa Rosa, Fátima, São Francisco, Charitas, Cafubá, Piratininga, Camboinhas, Itaipu, Itacoatiara, Maravista, Jardim Imbuí, Engenho do Mato, Santo Antônio, Serra Grande
        
        HTML:
        ${htmlContent}
        
        Se encontrar um imóvel válido nas regiões especificadas, retorne JSON com campos em INGLÊS e valores em PORTUGUÊS:
        {
          "neighborhood": "nome do bairro exato",
          "type": "apartment|house|penthouse|commercial|land",
          "price": valor_numerico_sem_formatacao,
          "area": area_em_metros_quadrados_numerico,
          "bedrooms": numero_quartos_numerico,
          "suites": numero_suites_numerico,
          "bathrooms": numero_banheiros_numerico,
          "parking": numero_vagas_numerico,
          "building": "nome do prédio/condomínio",
          "description": "descrição completa em português",
          "address": "endereço completo",
          "features": ["característica1", "característica2"],
          "furnished": true_ou_false,
          "title": "título do anúncio",
          "sourceUrl": "${htmlDoc.sourceUrl}"
        }
        
        Se NÃO for um imóvel válido ou não estiver nas regiões alvo, retorne: null
        
        IMPORTANTE: Retorne APENAS o JSON puro ou null, sem markdown, sem explicações.
      `;

      const result = await this.genAI.generateContent(prompt);
      const response = await result.response;
      const text = this.cleanAiResponse(response.text());
      
      if (text === "null" || text === "") {
        return null;
      }
      
      try {
        const property = JSON.parse(text);
        return property;
      } catch (parseError) {
        console.error("❌ Erro ao parsear JSON:", parseError.message);
        console.log("Resposta da IA:", text.substring(0, 200));
        return null;
      }
    } catch (error) {
      if (error.message.includes('429')) {
        console.log("⏳ Rate limit atingido, aguardando 15 segundos...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        return await this.processHtmlWithAI(htmlDoc);
      }
      
      console.error("❌ Erro na IA:", error.message);
      return null;
    }
  }

  // Gerar código único para propriedade
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
      return `IMV${Date.now().toString().slice(-6)}`;
    }
  }

  // Processar um documento HTML
  async processHtmlDoc(htmlDoc) {
    try {
      console.log(`🔄 Processando: ${htmlDoc.title || htmlDoc.sourceUrl}`);
      
      // Marcar como processando
      await this.adminDb.collection('properties_raw').doc(htmlDoc.id).update({
        processingStatus: 'processing',
        processingStartedAt: new Date()
      });

      // Processar com IA
      const propertyData = await this.processHtmlWithAI(htmlDoc);
      
      if (!propertyData) {
        // Marcar como ignorado
        await this.adminDb.collection('properties_raw').doc(htmlDoc.id).update({
          processingStatus: 'ignored',
          processedAt: new Date(),
          needsProcessing: false,
          ignoreReason: 'Não é um imóvel válido ou não está nas regiões alvo'
        });
        
        console.log(`⏭️ Ignorado: ${htmlDoc.title}`);
        return false;
      }

      // Gerar código único
      const code = await this.generatePropertyCode();
      
      // Criar propriedade processada
      const processedProperty = {
        code: code,
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        area: propertyData.area,
        
        address: {
          street: propertyData.address || '',
          neighborhood: propertyData.neighborhood,
          city: propertyData.neighborhood?.toLowerCase().includes('niterói') ? 'Niterói' : 'Rio de Janeiro',
          state: 'RJ',
          country: 'Brasil',
          zipCode: '',
          latitude: null,
          longitude: null
        },
        
        type: propertyData.type,
        status: 'available',
        bedrooms: propertyData.bedrooms || 0,
        suites: propertyData.suites || 0,
        bathrooms: propertyData.bathrooms || 0,
        parking: propertyData.parking || 0,
        furnished: propertyData.furnished || false,
        
        features: propertyData.features || [],
        amenities: [],
        building: propertyData.building || '',
        images: [],
        
        sourceUrl: propertyData.sourceUrl,
        source: 'html_processor',
        isActive: true,
        views: 0,
        favorites: 0,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        processedAt: new Date(),
        originalId: htmlDoc.id
      };

      // Salvar na coleção properties
      const newDocRef = await this.adminDb.collection('properties').add(processedProperty);
      
      // Marcar HTML como processado
      await this.adminDb.collection('properties_raw').doc(htmlDoc.id).update({
        processingStatus: 'completed',
        processedAt: new Date(),
        processedPropertyId: newDocRef.id,
        needsProcessing: false
      });
      
      console.log(`✅ Processado: ${processedProperty.title} -> ${newDocRef.id}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erro ao processar HTML:`, error.message);
      
      await this.adminDb.collection('properties_raw').doc(htmlDoc.id).update({
        processingStatus: 'error',
        processedAt: new Date(),
        error: error.message
      });
      
      return false;
    }
  }

  // Executar processador principal
  async run() {
    console.log('🔄 Iniciando processamento de HTMLs com IA...\n');
    
    try {
      const htmlDocs = await this.getUnprocessedHtml();
      
      if (htmlDocs.length === 0) {
        console.log('✅ Nenhum HTML pendente para processar');
        return;
      }

      let processedCount = 0;
      let ignoredCount = 0;
      let errorCount = 0;
      
      for (const htmlDoc of htmlDocs) {
        const success = await this.processHtmlDoc(htmlDoc);
        
        if (success === true) {
          processedCount++;
        } else if (success === false) {
          ignoredCount++;
        } else {
          errorCount++;
        }
        
        // Pausa entre processamentos para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`\n🎉 Processamento finalizado!`);
      console.log(`📊 Resumo:`);
      console.log(`- Propriedades processadas: ${processedCount}`);
      console.log(`- Ignoradas: ${ignoredCount}`);
      console.log(`- Erros: ${errorCount}`);
      console.log(`- Total: ${htmlDocs.length}`);
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
    }
  }
}

async function main() {
  try {
    const processor = new HtmlProcessor();
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

module.exports = { HtmlProcessor };
