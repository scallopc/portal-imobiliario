// Crawler avançado usando Playwright para contornar proteções anti-bot
require("dotenv").config();

const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { chromium } = require("playwright");

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

// Verificar se a chave da API Gemini está configurada
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não configurada no arquivo .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AdvancedPropertyCrawler {
  constructor() {
    this.adminDb = db;
    this.genAI = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.browser = null;
    this.context = null;
  }

  // Inicializar browser com configurações anti-detecção
  async initBrowser() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo'
      });

      console.log('🌐 Browser inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar browser:', error.message);
      throw error;
    }
  }

  // Buscar links da coleção 'links' no Firebase
  async getLinksFromFirebase() {
    try {
      console.log('🔍 Buscando links da coleção "links" no Firebase...');
      
      const linksSnapshot = await this.adminDb.collection('links')
        .where('processed', '==', false)
        .limit(10)
        .get();

      if (linksSnapshot.empty) {
        console.log('⚠️ Nenhum link pendente encontrado na coleção "links"');
        
        // Criar alguns links de exemplo se não existirem
        await this.createSampleLinks();
        
        // Tentar buscar novamente
        const newSnapshot = await this.adminDb.collection('links')
          .where('processed', '==', false)
          .limit(5)
          .get();
          
        if (newSnapshot.empty) {
          return [];
        }
        
        const links = [];
        newSnapshot.docs.forEach(doc => {
          links.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return links;
      }

      const links = [];
      linksSnapshot.docs.forEach(doc => {
        links.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`📋 Encontrados ${links.length} links para processar`);
      return links;
    } catch (error) {
      console.error('❌ Erro ao buscar links:', error.message);
      return [];
    }
  }

  // Criar links de exemplo na coleção
  async createSampleLinks() {
    try {
      console.log('📝 Criando links de exemplo...');
      
      const sampleLinks = [
        {
          url: 'https://www.olx.com.br/imoveis/venda/estado-rj/rio-de-janeiro',
          type: 'portal',
          description: 'OLX Imóveis - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        },
        {
          url: 'https://www.imovelweb.com.br/imoveis-venda-rio-de-janeiro-rj.html',
          type: 'portal', 
          description: 'ImovelWeb - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        },
        {
          url: 'https://www.chavesnamao.com.br/imoveis-para-comprar/rj-rio-de-janeiro/',
          type: 'portal',
          description: 'Chaves na Mão - Rio de Janeiro',
          processed: false,
          createdAt: new Date()
        }
      ];

      for (const link of sampleLinks) {
        await this.adminDb.collection('links').add(link);
      }
      
      console.log('✅ Links de exemplo criados');
    } catch (error) {
      console.error('❌ Erro ao criar links:', error.message);
    }
  }

  // Fazer scraping de uma URL usando Playwright
  async scrapeUrlWithPlaywright(url) {
    try {
      console.log(`🔍 Fazendo scraping: ${url}`);
      
      const page = await this.context.newPage();
      
      // Configurar interceptação de requests para bloquear recursos desnecessários
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });

      // Navegar para a página
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      // Aguardar um pouco para o conteúdo carregar
      await page.waitForTimeout(3000);

      // Extrair dados da página
      const pageData = await page.evaluate(() => {
        // Remover elementos desnecessários
        const elementsToRemove = document.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .cookie-banner');
        elementsToRemove.forEach(el => el.remove());

        return {
          title: document.title || '',
          description: document.querySelector('meta[name="description"]')?.content || '',
          content: document.body?.innerText?.substring(0, 8000) || '',
          url: window.location.href
        };
      });

      // Extrair links de imóveis
      const propertyLinks = await page.evaluate(() => {
        const linkSelectors = [
          'a[href*="/imovel"]',
          'a[href*="/propriedade"]', 
          'a[href*="/apartamento"]',
          'a[href*="/casa"]',
          'a[href*="/anuncio"]',
          '.property-card a',
          '.listing-item a',
          '.result-item a',
          '.ad-card a'
        ];

        const links = new Set();
        
        linkSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(link => {
            const href = link.href;
            if (href && href.includes('http') && !href.includes('javascript:')) {
              links.add(href);
            }
          });
        });

        return Array.from(links).slice(0, 15); // Limitar a 15 links
      });

      await page.close();

      return {
        pageData,
        propertyLinks
      };
    } catch (error) {
      console.error(`❌ Erro ao fazer scraping de ${url}:`, error.message);
      return null;
    }
  }

  // Usar IA para extrair dados de imóveis
  async extractPropertyDataWithAI(pageData, sourceUrl) {
    try {
      const prompt = `
        Analise o seguinte conteúdo e extraia informações de imóveis APENAS das seguintes regiões:
        
        RIO DE JANEIRO: Barra da Tijuca, Joá, Itanhangá, Recreio dos Bandeirantes, Camorim, Vargem Grande, Vargem Pequena, Grumari
        NITERÓI: Icaraí, Santa Rosa, Fátima, São Francisco, Charitas, Cafubá, Piratininga, Camboinhas, Itaipu, Itacoatiara, Maravista, Jardim Imbuí, Engenho do Mato, Santo Antônio, Serra Grande
        
        TÍTULO: ${pageData.title}
        DESCRIÇÃO: ${pageData.description}
        CONTEÚDO: ${pageData.content}
        URL: ${sourceUrl}
        
        Se encontrar um imóvel válido nas regiões especificadas, retorne JSON com campos em INGLÊS e valores em PORTUGUÊS:
        {
          "neighborhood": "nome do bairro exato",
          "type": "apartment|house|penthouse|commercial|land",
          "price": valor_numerico_limpo,
          "area": area_em_metros_quadrados,
          "bedrooms": numero_quartos,
          "suites": numero_suites,
          "bathrooms": numero_banheiros,
          "parking": numero_vagas,
          "building": "nome do prédio/condomínio",
          "description": "descrição em português",
          "address": "endereço completo",
          "features": ["característica1", "característica2"],
          "furnished": true_ou_false,
          "title": "título do anúncio",
          "sourceUrl": "${sourceUrl}"
        }
        
        Se NÃO for um imóvel válido ou não estiver nas regiões alvo, retorne: null
        
        IMPORTANTE: Retorne APENAS o JSON ou null, sem explicações.
      `;

      const result = await this.genAI.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      if (text === "null" || text === "") {
        return null;
      }
      
      try {
        const property = JSON.parse(text);
        return property;
      } catch (parseError) {
        console.error("❌ Erro ao parsear JSON da IA:", parseError.message);
        return null;
      }
    } catch (error) {
      console.error("❌ Erro ao extrair dados com IA:", error.message);
      return null;
    }
  }

  // Processar um link específico
  async processLink(linkData) {
    try {
      console.log(`🔍 Processando link: ${linkData.url}`);
      
      // Marcar como processando
      await this.adminDb.collection('links').doc(linkData.id).update({
        processingStatus: 'processing',
        processingStartedAt: new Date()
      });

      // Fazer scraping da página principal
      const scrapingResult = await this.scrapeUrlWithPlaywright(linkData.url);
      
      if (!scrapingResult) {
        await this.adminDb.collection('links').doc(linkData.id).update({
          processed: true,
          processingStatus: 'failed',
          processedAt: new Date(),
          error: 'Falha no scraping'
        });
        return 0;
      }

      let savedCount = 0;
      
      // Processar links de imóveis encontrados
      for (const propertyUrl of scrapingResult.propertyLinks.slice(0, 8)) {
        try {
          const propertyResult = await this.scrapeUrlWithPlaywright(propertyUrl);
          
          if (propertyResult) {
            const propertyData = await this.extractPropertyDataWithAI(propertyResult.pageData, propertyUrl);
            
            if (propertyData) {
              // Salvar em properties_raw
              const rawData = {
                ...propertyData,
                source: 'advanced_crawler',
                site: linkData.type,
                needsProcessing: true,
                processingStatus: 'pending',
                extractedAt: new Date(),
                createdAt: new Date(),
                linkId: linkData.id
              };

              await this.adminDb.collection('properties_raw').add(rawData);
              savedCount++;
              
              console.log(`✅ Salvo: ${propertyData.type} em ${propertyData.neighborhood} - R$ ${propertyData.price?.toLocaleString() || 'N/A'}`);
            }
          }
          
          // Pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Erro ao processar ${propertyUrl}:`, error.message);
        }
      }

      // Marcar link como processado
      await this.adminDb.collection('links').doc(linkData.id).update({
        processed: true,
        processingStatus: 'completed',
        processedAt: new Date(),
        propertiesFound: savedCount
      });

      console.log(`📊 Link processado: ${savedCount} propriedades encontradas`);
      return savedCount;
      
    } catch (error) {
      console.error(`❌ Erro ao processar link:`, error.message);
      
      await this.adminDb.collection('links').doc(linkData.id).update({
        processed: true,
        processingStatus: 'error',
        processedAt: new Date(),
        error: error.message
      });
      
      return 0;
    }
  }

  // Executar crawler principal
  async run() {
    console.log('🚀 Iniciando crawler avançado de imóveis...\n');
    
    try {
      // Inicializar browser
      await this.initBrowser();
      
      // Buscar links do Firebase
      const links = await this.getLinksFromFirebase();
      
      if (links.length === 0) {
        console.log('⚠️ Nenhum link encontrado para processar');
        return;
      }

      let totalProperties = 0;
      
      for (const link of links) {
        const propertiesFound = await this.processLink(link);
        totalProperties += propertiesFound;
        
        // Pausa entre links
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log(`\n🎉 Crawler finalizado!`);
      console.log(`📊 Resumo:`);
      console.log(`- Links processados: ${links.length}`);
      console.log(`- Propriedades encontradas: ${totalProperties}`);
      console.log(`\n💡 Próximo passo: node scripts/process-properties.js`);
      
    } catch (error) {
      console.error('❌ Erro geral no crawler:', error);
    } finally {
      // Fechar browser
      if (this.browser) {
        await this.browser.close();
        console.log('🌐 Browser fechado');
      }
    }
  }
}

async function main() {
  try {
    const crawler = new AdvancedPropertyCrawler();
    await crawler.run();
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AdvancedPropertyCrawler };
