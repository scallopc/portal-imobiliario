// Sistema completo de crawler para garimpar imóveis reais
require("dotenv").config();

const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const cheerio = require("cheerio");
// Configuração dos bairros alvo
const TARGET_NEIGHBORHOODS = {
  rio_de_janeiro: {
    zona_sul: [
      "Barra da Tijuca",
      "Joá",
      "Itanhangá",
      "Recreio dos Bandeirantes",
      "Camorim",
      "Vargem Grande",
      "Vargem Pequena",
      "Grumari",
    ],
  },
  niteroi: {
    zona_sul: ["Icaraí", "Santa Rosa", "Fátima", "São Francisco", "Charitas"],
    regiao_oceanica: [
      "Cafubá",
      "Piratininga",
      "Camboinhas",
      "Itaipu",
      "Itacoatiara",
      "Maravista",
      "Jardim Imbuí",
      "Engenho do Mato",
      "Santo Antônio",
      "Serra Grande",
    ],
  },
};

const ALL_NEIGHBORHOODS = [
  ...TARGET_NEIGHBORHOODS.rio_de_janeiro.zona_sul,
  ...TARGET_NEIGHBORHOODS.niteroi.zona_sul,
  ...TARGET_NEIGHBORHOODS.niteroi.regiao_oceanica,
];

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

class PropertyCrawler {
  constructor() {
    this.adminDb = db;
    this.genAI = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];
    this.processedUrls = new Set();
  }

  // Gerar URLs de busca para os bairros alvo
  generateSearchUrls() {
    const urls = [];

    // VivaReal - principais bairros
    ALL_NEIGHBORHOODS.forEach(neighborhood => {
      urls.push({
        url: `https://www.vivareal.com.br/venda/rio-de-janeiro/${neighborhood.toLowerCase().replace(/\s+/g, "-")}/`,
        site: "vivareal",
        neighborhood: neighborhood,
        type: "search",
      });
    });

    // ZAP Imóveis - principais bairros
    ALL_NEIGHBORHOODS.forEach(neighborhood => {
      urls.push({
        url: `https://www.zapimoveis.com.br/venda/imoveis/rj+rio-de-janeiro+${neighborhood.toLowerCase().replace(/\s+/g, "-")}/`,
        site: "zapimoveis",
        neighborhood: neighborhood,
        type: "search",
      });
    });

    // OLX - por região
    urls.push(
      {
        url: "https://www.olx.com.br/imoveis/venda/estado-rj/rio-de-janeiro/zona-sul",
        site: "olx",
        region: "zona-sul",
        type: "search",
      },
      {
        url: "https://www.olx.com.br/imoveis/venda/estado-rj/niteroi",
        site: "olx",
        region: "niteroi",
        type: "search",
      }
    );

    return urls;
  }

  // Fazer scraping de uma URL
  async scrapeUrl(url, retries = 3) {
    try {
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];

      const response = await axios.get(url, {
        headers: {
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        timeout: 30000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      return {
        html: response.data,
        $: $,
        title: $("title").text().trim(),
        description: $('meta[name="description"]').attr("content") || "",
        content: this.extractMainContent($),
      };
    } catch (error) {
      if (retries > 0) {
        console.log(`⚠️ Tentando novamente ${url} (${retries} tentativas restantes)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.scrapeUrl(url, retries - 1);
      }

      console.error(`❌ Erro ao fazer scraping de ${url}:`, error.message);
      return null;
    }
  }

  // Extrair conteúdo principal da página
  extractMainContent($) {
    // Remover elementos desnecessários
    $("script, style, nav, header, footer, aside, .advertisement, .ads, .cookie").remove();

    // Tentar encontrar o conteúdo principal
    let mainContent = "";

    const contentSelectors = [
      "main",
      '[role="main"]',
      ".results",
      ".listings",
      ".property-list",
      ".search-results",
      ".content",
      "article",
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContent = element.text().trim();
        break;
      }
    }

    // Fallback: pegar todo o texto do body
    if (!mainContent) {
      mainContent = $("body").text().trim();
    }

    // Limitar tamanho do conteúdo
    return mainContent.substring(0, 8000);
  }

  // Extrair links de imóveis da página de resultados
  extractPropertyLinks($, baseUrl) {
    const links = [];
    const linkSelectors = [
      'a[href*="/imovel/"]',
      'a[href*="/propriedade/"]',
      'a[href*="/property/"]',
      'a[href*="/apartamento/"]',
      'a[href*="/casa/"]',
      ".property-card a",
      ".listing-item a",
      ".result-item a",
    ];

    linkSelectors.forEach(selector => {
      $(selector).each((i, element) => {
        const href = $(element).attr("href");
        if (href) {
          let fullUrl = href;
          if (href.startsWith("/")) {
            const urlObj = new URL(baseUrl);
            fullUrl = `${urlObj.protocol}//${urlObj.host}${href}`;
          } else if (!href.startsWith("http")) {
            fullUrl = new URL(href, baseUrl).href;
          }

          if (!this.processedUrls.has(fullUrl)) {
            links.push(fullUrl);
            this.processedUrls.add(fullUrl);
          }
        }
      });
    });

    return [...new Set(links)]; // Remove duplicatas
  }

  // Usar IA para extrair dados de imóveis
  async extractPropertyDataWithAI(pageData, sourceUrl) {
    try {
      const prompt = `
        Analise o seguinte conteúdo de uma página de imóvel e extraia as informações estruturadas.
        
        TÍTULO: ${pageData.title}
        DESCRIÇÃO: ${pageData.description}
        CONTEÚDO: ${pageData.content}
        URL: ${sourceUrl}
        
        Extraia APENAS se for realmente um imóvel nas seguintes regiões:
        - Rio de Janeiro: ${TARGET_NEIGHBORHOODS.rio_de_janeiro.zona_oeste.join(', ')}
        - Niterói: ${[...TARGET_NEIGHBORHOODS.niteroi.zona_sul, ...TARGET_NEIGHBORHOODS.niteroi.regiao_oceanica].join(', ')}
        
        Se encontrar um imóvel válido, retorne JSON com campos em INGLÊS e valores em PORTUGUÊS:
        {
          "neighborhood": "nome do bairro exato",
          "type": "apartment|house|penthouse|commercial|land",
          "price": valor_numerico_sem_pontos_ou_virgulas,
          "area": area_em_metros_quadrados_numerico,
          "bedrooms": numero_quartos_numerico,
          "suites": numero_suites_numerico,
          "bathrooms": numero_banheiros_numerico,
          "parking": numero_vagas_numerico,
          "building": "nome do prédio/condomínio se houver",
          "description": "descrição completa em português",
          "address": "endereço completo se disponível",
          "features": ["característica1", "característica2"],
          "furnished": true_ou_false,
          "sourceUrl": "${sourceUrl}",
          "title": "título do anúncio"
        }
        
        Se NÃO for um imóvel válido ou não estiver nas regiões alvo, retorne: null
        
        IMPORTANTE: Retorne APENAS o JSON ou null, sem explicações.
      `;

      const result = await this.genAI.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Tentar extrair JSON da resposta
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

  // Processar uma página de resultados
  async processSearchPage(searchData) {
    try {
      console.log(`🔍 Processando: ${searchData.url}`);

      const pageData = await this.scrapeUrl(searchData.url);
      if (!pageData) {
        return 0;
      }

      // Extrair links de imóveis
      const propertyLinks = this.extractPropertyLinks(pageData.$, searchData.url);
      console.log(`📋 Encontrados ${propertyLinks.length} links de imóveis`);

      let savedCount = 0;

      // Processar cada link de imóvel
      for (const propertyUrl of propertyLinks.slice(0, 10)) {
        // Limitar a 10 por página
        try {
          const propertyPageData = await this.scrapeUrl(propertyUrl);
          if (!propertyPageData) continue;

          // Extrair dados com IA
          const propertyData = await this.extractPropertyDataWithAI(propertyPageData, propertyUrl);

          if (propertyData) {
            // Salvar em properties_raw
            const rawData = {
              ...propertyData,
              source: "property_crawler",
              site: searchData.site,
              needsProcessing: true,
              processingStatus: "pending",
              extractedAt: new Date(),
              createdAt: new Date(),
            };

            await this.adminDb.collection("properties_raw").add(rawData);
            savedCount++;

            console.log(
              `✅ Salvo: ${propertyData.type} em ${propertyData.neighborhood} - R$ ${propertyData.price?.toLocaleString() || "N/A"}`
            );
          }

          // Pausa entre requests
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`❌ Erro ao processar ${propertyUrl}:`, error.message);
        }
      }

      return savedCount;
    } catch (error) {
      console.error(`❌ Erro ao processar página de busca:`, error.message);
      return 0;
    }
  }

  // Executar crawler principal
  async run() {
    console.log("🚀 Iniciando crawler de imóveis...\n");

    try {
      const searchUrls = this.generateSearchUrls();
      console.log(`📋 ${searchUrls.length} URLs de busca geradas`);

      let totalProperties = 0;

      for (const searchData of searchUrls.slice(0, 5)) {
        // Limitar a 5 sites inicialmente
        const propertiesFound = await this.processSearchPage(searchData);
        totalProperties += propertiesFound;

        // Pausa entre sites
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      console.log(`\n🎉 Crawler finalizado!`);
      console.log(`📊 Resumo:`);
      console.log(`- Propriedades encontradas: ${totalProperties}`);
      console.log(`\n💡 Próximo passo: node scripts/process-properties.js`);
    } catch (error) {
      console.error("❌ Erro geral no crawler:", error);
    }
  }
}

async function main() {
  try {
    const crawler = new PropertyCrawler();
    await crawler.run();
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PropertyCrawler };
