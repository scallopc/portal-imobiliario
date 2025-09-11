// Scraper que salva HTML bruto de imóveis em properties_raw
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

class HtmlScraper {
  constructor() {
    this.adminDb = db;
    this.genAI = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.browser = null;
    this.context = null;
    this.processedUrls = new Set();
  }

  // Inicializar browser
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
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        locale: 'pt-BR'
      });

      console.log('🌐 Browser inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar browser:', error.message);
      throw error;
    }
  }

  // Buscar links da coleção 'links'
  async getLinksFromFirebase() {
    try {
      console.log('🔍 Buscando links da coleção "links"...');
      
      // Primeiro verificar se existem links
      const allLinksSnapshot = await this.adminDb.collection('links').limit(1).get();
      
      if (allLinksSnapshot.empty) {
        console.log('⚠️ Coleção "links" vazia. Criando links de exemplo...');
        await this.createSampleLinks();
      }
      
      // Buscar links não processados
      const linksSnapshot = await this.adminDb.collection('links')
        .where('processed', '==', false)
        .limit(5)
        .get();

      if (linksSnapshot.empty) {
        console.log('⚠️ Todos os links já foram processados. Resetando...');
        
        // Resetar todos os links para não processados
        const allLinks = await this.adminDb.collection('links').get();
        const batch = this.adminDb.batch();
        
        allLinks.docs.forEach(doc => {
          batch.update(doc.ref, {
            processed: false,
            processingStatus: 'pending'
          });
        });
        
        await batch.commit();
        console.log('✅ Links resetados');
        
        // Buscar novamente
        const newLinksSnapshot = await this.adminDb.collection('links')
          .where('processed', '==', false)
          .limit(5)
          .get();
          
        const links = [];
        newLinksSnapshot.docs.forEach(doc => {
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

  // Criar links de exemplo
  async createSampleLinks() {
    try {
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

  // Extrair links de imóveis de uma página de listagem
  async extractPropertyLinksFromPage(url) {
    try {
      console.log(`🔍 Extraindo links de: ${url}`);
      
      const page = await this.context.newPage();
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      await page.waitForTimeout(3000);

      // Extrair links de imóveis
      const propertyLinks = await page.evaluate(() => {
        const linkSelectors = [
          'a[href*="/imovel"]',
          'a[href*="/propriedade"]', 
          'a[href*="/apartamento"]',
          'a[href*="/casa"]',
          'a[href*="/anuncio"]',
          'a[href*="/listing"]',
          '.property-card a',
          '.listing-item a',
          '.result-item a',
          '.ad-card a',
          '.card-link'
        ];

        const links = new Set();
        
        linkSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(link => {
            const href = link.href;
            if (href && 
                href.includes('http') && 
                !href.includes('javascript:') &&
                !href.includes('mailto:') &&
                !href.includes('tel:')) {
              links.add(href);
            }
          });
        });

        return Array.from(links);
      });

      await page.close();
      
      console.log(`📋 Encontrados ${propertyLinks.length} links de imóveis`);
      return propertyLinks;
      
    } catch (error) {
      console.error(`❌ Erro ao extrair links de ${url}:`, error.message);
      return [];
    }
  }

  // Fazer scraping do HTML bruto de um imóvel
  async scrapePropertyHtml(url) {
    try {
      if (this.processedUrls.has(url)) {
        return null;
      }
      
      this.processedUrls.add(url);
      console.log(`📄 Coletando HTML: ${url}`);
      
      const page = await this.context.newPage();
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      await page.waitForTimeout(2000);

      // Extrair HTML limpo
      const htmlData = await page.evaluate(() => {
        // Remover elementos desnecessários
        const elementsToRemove = document.querySelectorAll(
          'script, style, nav, header, footer, aside, .advertisement, .ads, .cookie-banner, .modal, .popup'
        );
        elementsToRemove.forEach(el => el.remove());

        return {
          title: document.title || '',
          url: window.location.href,
          html: document.documentElement.outerHTML,
          text: document.body?.innerText || ''
        };
      });

      await page.close();
      return htmlData;
      
    } catch (error) {
      console.error(`❌ Erro ao coletar HTML de ${url}:`, error.message);
      return null;
    }
  }

  // Salvar HTML bruto no Firebase
  async saveRawHtml(htmlData, linkId) {
    try {
      const rawData = {
        title: htmlData.title,
        sourceUrl: htmlData.url,
        rawHtml: htmlData.html,
        rawText: htmlData.text.substring(0, 5000), // Limitar texto
        source: 'html_scraper',
        needsProcessing: true,
        processingStatus: 'pending',
        extractedAt: new Date(),
        createdAt: new Date(),
        linkId: linkId
      };

      const docRef = await this.adminDb.collection('properties_raw').add(rawData);
      console.log(`💾 HTML salvo: ${docRef.id}`);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Erro ao salvar HTML:', error.message);
      return null;
    }
  }

  // Processar um link específico
  async processLink(linkData) {
    try {
      console.log(`🔍 Processando: ${linkData.url}`);
      
      // Marcar como processando
      await this.adminDb.collection('links').doc(linkData.id).update({
        processingStatus: 'processing',
        processingStartedAt: new Date()
      });

      // Extrair links de imóveis da página de listagem
      const propertyLinks = await this.extractPropertyLinksFromPage(linkData.url);
      
      let savedCount = 0;
      
      // Processar cada link de imóvel (limitar a 10)
      for (const propertyUrl of propertyLinks.slice(0, 10)) {
        const htmlData = await this.scrapePropertyHtml(propertyUrl);
        
        if (htmlData) {
          const savedId = await this.saveRawHtml(htmlData, linkData.id);
          if (savedId) {
            savedCount++;
          }
        }
        
        // Pausa entre requests
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Marcar link como processado
      await this.adminDb.collection('links').doc(linkData.id).update({
        processed: true,
        processingStatus: 'completed',
        processedAt: new Date(),
        htmlPagesSaved: savedCount
      });

      console.log(`📊 Link processado: ${savedCount} páginas HTML salvas`);
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

  // Executar scraper principal
  async run() {
    console.log('🚀 Iniciando coleta de HTML bruto de imóveis...\n');
    
    try {
      await this.initBrowser();
      
      const links = await this.getLinksFromFirebase();
      
      if (links.length === 0) {
        console.log('⚠️ Nenhum link encontrado para processar');
        return;
      }

      let totalPages = 0;
      
      for (const link of links) {
        const pagesSaved = await this.processLink(link);
        totalPages += pagesSaved;
        
        // Pausa entre links
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log(`\n🎉 Coleta finalizada!`);
      console.log(`📊 Resumo:`);
      console.log(`- Links processados: ${links.length}`);
      console.log(`- Páginas HTML salvas: ${totalPages}`);
      console.log(`\n💡 Próximo passo: node scripts/process-html.js`);
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('🌐 Browser fechado');
      }
    }
  }
}

async function main() {
  try {
    const scraper = new HtmlScraper();
    await scraper.run();
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HtmlScraper };
