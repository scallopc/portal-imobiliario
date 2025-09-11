// Gerador de imóveis usando IA para alimentar a base de dados
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

class AIPropertyGenerator {
  constructor() {
    this.adminDb = db;
    this.genAI = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Configuração das regiões alvo
    this.targetNeighborhoods = {
      rio_de_janeiro: {
        zona_oeste: [
          'Barra da Tijuca',
          'Joá',
          'Itanhangá', 
          'Recreio dos Bandeirantes',
          'Camorim',
          'Vargem Grande',
          'Vargem Pequena',
          'Grumari'
        ]
      },
      niteroi: {
        zona_sul: [
          'Icaraí',
          'Santa Rosa',
          'Fátima',
          'São Francisco',
          'Charitas'
        ],
        regiao_oceanica: [
          'Cafubá',
          'Piratininga', 
          'Camboinhas',
          'Itaipu',
          'Itacoatiara',
          'Maravista',
          'Jardim Imbuí',
          'Engenho do Mato',
          'Santo Antônio',
          'Serra Grande'
        ]
      }
    };
    
    this.allNeighborhoods = [
      ...this.targetNeighborhoods.rio_de_janeiro.zona_oeste,
      ...this.targetNeighborhoods.niteroi.zona_sul,
      ...this.targetNeighborhoods.niteroi.regiao_oceanica
    ];
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

  // Gerar imóveis para um bairro específico usando IA
  async generatePropertiesForNeighborhood(neighborhood) {
    try {
      console.log(`🏠 Gerando imóveis para ${neighborhood}...`);
      
      const isNiteroi = this.targetNeighborhoods.niteroi.zona_sul.includes(neighborhood) || 
                       this.targetNeighborhoods.niteroi.regiao_oceanica.includes(neighborhood);
      
      const city = isNiteroi ? 'Niterói' : 'Rio de Janeiro';
      
      const prompt = `
        Gere uma lista de 8 imóveis realistas para venda no bairro ${neighborhood}, ${city}, RJ.
        
        Contexto do bairro:
        - ${neighborhood} é um bairro ${isNiteroi ? 'de Niterói' : 'do Rio de Janeiro'}
        - Área valorizada com boa infraestrutura
        - Próximo ao mar e com boa qualidade de vida
        - Preços condizentes com a região
        
        Para cada imóvel, retorne JSON com campos em INGLÊS e valores em PORTUGUÊS:
        [
          {
            "neighborhood": "${neighborhood}",
            "type": "apartment|house|penthouse|commercial",
            "price": valor_numerico_realista_sem_formatacao,
            "area": area_em_metros_quadrados,
            "bedrooms": numero_quartos,
            "suites": numero_suites,
            "bathrooms": numero_banheiros,
            "parking": numero_vagas,
            "building": "nome_do_condominio_ou_edificio",
            "description": "descrição detalhada e atrativa em português",
            "address": "endereço realista no bairro",
            "features": ["característica1", "característica2", "característica3"],
            "furnished": true_ou_false,
            "title": "título atrativo do anúncio"
          }
        ]
        
        Diretrizes:
        - Preços realistas para ${neighborhood} (pesquise valores de mercado)
        - Descrições detalhadas e atrativas
        - Endereços verossímeis (ruas que existem no bairro)
        - Características condizentes com o tipo de imóvel
        - Nomes de condomínios/edifícios realistas
        - Variedade de tipos (apartamentos, casas, coberturas)
        
        IMPORTANTE: Retorne APENAS o array JSON, sem explicações ou markdown.
      `;

      const result = await this.genAI.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Limpar resposta removendo markdown se houver
      const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      try {
        const properties = JSON.parse(cleanText);
        return Array.isArray(properties) ? properties : [];
      } catch (parseError) {
        console.error(`❌ Erro ao parsear JSON para ${neighborhood}:`, parseError.message);
        console.log("Resposta da IA:", text.substring(0, 200));
        return [];
      }
    } catch (error) {
      if (error.message.includes('429')) {
        console.log("⏳ Rate limit atingido, aguardando 15 segundos...");
        await new Promise(resolve => setTimeout(resolve, 15000));
        return await this.generatePropertiesForNeighborhood(neighborhood);
      }
      
      console.error(`❌ Erro ao gerar imóveis para ${neighborhood}:`, error.message);
      return [];
    }
  }

  // Salvar propriedade no Firebase
  async saveProperty(propertyData) {
    try {
      const code = await this.generatePropertyCode();
      
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
        
        sourceUrl: '',
        source: 'ai_generator',
        isActive: true,
        views: 0,
        favorites: 0,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        processedAt: new Date()
      };

      const docRef = await this.adminDb.collection('properties').add(processedProperty);
      
      console.log(`✅ Salvo: ${processedProperty.title} - R$ ${processedProperty.price?.toLocaleString()} (${docRef.id})`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao salvar propriedade:', error.message);
      return null;
    }
  }

  // Executar geração para todos os bairros
  async run() {
    console.log('🤖 Iniciando geração de imóveis com IA...\n');
    
    try {
      let totalGenerated = 0;
      
      // Processar cada bairro
      for (const neighborhood of this.allNeighborhoods) {
        const properties = await this.generatePropertiesForNeighborhood(neighborhood);
        
        // Salvar cada propriedade
        for (const property of properties) {
          const savedId = await this.saveProperty(property);
          if (savedId) {
            totalGenerated++;
          }
          
          // Pausa entre salvamentos
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`📊 ${neighborhood}: ${properties.length} imóveis gerados\n`);
        
        // Pausa entre bairros para evitar rate limit
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log(`🎉 Geração finalizada!`);
      console.log(`📊 Resumo:`);
      console.log(`- Bairros processados: ${this.allNeighborhoods.length}`);
      console.log(`- Imóveis gerados: ${totalGenerated}`);
      console.log(`\n💡 Os imóveis estão disponíveis na coleção "properties"`);
      
    } catch (error) {
      console.error('❌ Erro geral na geração:', error);
    }
  }

  // Gerar apenas alguns imóveis de teste
  async runTest(count = 5) {
    console.log(`🧪 Gerando ${count} imóveis de teste...\n`);
    
    try {
      let totalGenerated = 0;
      const testNeighborhoods = this.allNeighborhoods.slice(0, 3); // Apenas 3 bairros
      
      for (const neighborhood of testNeighborhoods) {
        const properties = await this.generatePropertiesForNeighborhood(neighborhood);
        
        // Limitar quantidade para teste
        const limitedProperties = properties.slice(0, Math.ceil(count / testNeighborhoods.length));
        
        for (const property of limitedProperties) {
          const savedId = await this.saveProperty(property);
          if (savedId) {
            totalGenerated++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`🎉 Teste finalizado!`);
      console.log(`📊 ${totalGenerated} imóveis de teste gerados`);
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
}

async function main() {
  try {
    const generator = new AIPropertyGenerator();
    
    // Verificar se é modo teste
    const isTest = process.argv.includes('--test');
    
    if (isTest) {
      await generator.runTest(10);
    } else {
      await generator.run();
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AIPropertyGenerator };
