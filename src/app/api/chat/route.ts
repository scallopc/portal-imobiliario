import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";
import { Property } from "@/types";
import {
  getClientIP,
  getGeoLocation,
  findNearbyProperties,
  extractClientInfo,
  type GeoLocation,
} from "@/lib/geo-utils";
import { createLead } from "@/actions/create-lead";
import { createChatInteraction } from "@/actions/create-chat-interaction";
import { defaultNeighborhoods } from "@/lib/constants";

interface PropertyWithAlternative extends Property {
  isAlternative?: boolean;
}

// Função para buscar propriedades do Firebase (properties + releases)
async function getPropertiesData(): Promise<Property[]> {
  try {
    // Buscar em ambas as coleções em paralelo
    const [propertiesSnapshot, releasesSnapshot] = await Promise.all([
      adminDb.collection("properties").limit(50).get(),
      adminDb.collection("releases").limit(50).get()
    ]);

    // Mapear properties
    const properties = propertiesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        type: data.type || '',
        price: data.price || 0,
        area: data.area || 0,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parking: data.parking || 0,
        address: data.address || {},
        images: data.images || [],
        features: data.features || [],
        contact: data.contact || {},
        slug: data.slug || doc.id,
        source: 'properties',
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Property;
    });

    // Mapear releases (adaptar estrutura para Property)
    const releases = releasesSnapshot.docs.map(doc => {
      const data = doc.data();
      // Pegar a primeira unidade para extrair informações
      const firstUnit = data.units?.[0] || {};
      
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        type: firstUnit.type || 'apartamento',
        price: data.minPrice || firstUnit.price || 0,
        area: firstUnit.area || 0,
        bedrooms: firstUnit.bedrooms || 0,
        bathrooms: firstUnit.bathrooms || 0,
        parking: firstUnit.parking || 0,
        address: data.location || {},
        images: data.images || [],
        features: data.features || [],
        contact: data.contact || {},
        slug: data.slug || doc.id,
        source: 'releases',
        developer: data.developer,
        deliveryDate: data.deliveryDate,
        totalUnits: data.totalUnits,
        availableUnits: data.availableUnits,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Property;
    });

    // Combinar ambas as coleções
    return [...properties, ...releases];
  } catch (error) {
    console.error("Erro ao buscar propriedades:", error);
    return [];
  }
}

// Função para buscar propriedades por filtros específicos
async function searchProperties(query: string, userLocation?: GeoLocation): Promise<PropertyWithAlternative[]> {
  try {
    const queryLower = query.toLowerCase();
    const allProperties = await getPropertiesData();

    // Extrair informações da query (incluindo milhões)
    const priceMatchMillion = queryLower.match(/(\d+(?:[.,]\d+)?)\s*(?:milhões?|milhao|milhoes|m)\b/i);
    const priceMatchThousand = queryLower.match(/(\d+)\s*(?:mil|k)\b/i);
    
    let maxPrice = null;
    let minPrice = null;
    
    if (priceMatchMillion) {
      // Converter milhões para valor numérico
      const millions = parseFloat(priceMatchMillion[1].replace(',', '.'));
      maxPrice = millions * 1000000;
      minPrice = Math.max(0, maxPrice * 0.8); // 20% abaixo
    } else if (priceMatchThousand) {
      maxPrice = parseInt(priceMatchThousand[1]) * 1000;
      minPrice = Math.max(0, maxPrice - 50000);
    }

    // Buscar por tipo de imóvel
    const propertyTypes = ["casa", "apartamento", "terreno", "comercial"];
    const requestedType = propertyTypes.find(type => queryLower.includes(type));

    // Buscar por características
    const bedroomsMatch = queryLower.match(/(\d+)\s*quarto/);
    const requestedBedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : null;

    // Busca inteligente por múltiplos campos
    const relevantProperties = allProperties.filter(property => {
      const title = property.title?.toLowerCase() || "";
      const description = property.description?.toLowerCase() || "";
      const city = property.address?.city?.toLowerCase() || "";
      const neighborhood = property.address?.neighborhood?.toLowerCase() || "";
      const type = property.type?.toLowerCase() || "";
      const price = property.price || 0;

      // Busca por texto
      const textMatch =
        title.includes(queryLower) ||
        description.includes(queryLower) ||
        city.includes(queryLower) ||
        neighborhood.includes(queryLower) ||
        type.includes(queryLower);

      // Busca por preço
      const priceMatch = maxPrice ? price <= maxPrice && price >= (minPrice || 0) : false;

      // Busca por tipo específico
      const typeMatch = requestedType ? type === requestedType : false;

      // Busca por quartos
      const bedroomMatch = requestedBedrooms ? property.bedrooms && property.bedrooms >= requestedBedrooms : false;

      // Busca por qualificadores
      const qualifierMatch =
        (queryLower.includes("barato") && price < 200000) ||
        (queryLower.includes("caro") && price > 500000) ||
        (queryLower.includes("grande") && property.area > 150) ||
        (queryLower.includes("pequeno") && property.area < 80);

      return textMatch || priceMatch || typeMatch || bedroomMatch || qualifierMatch;
    });

    // Se não encontrou resultados exatos, buscar alternativas atrativas
    if (relevantProperties.length === 0) {
      let alternatives = allProperties.filter(property => {
        const price = property.price || 0;
        // Buscar imóveis em faixa de preço similar ou um pouco acima
        if (maxPrice) {
          return price <= maxPrice * 1.5; // Até 50% acima do preço solicitado
        }
        // Se não especificou preço, buscar por tipo similar
        if (requestedType) {
          const similarTypes: Record<string, string[]> = {
            casa: ["apartamento", "terreno"],
            apartamento: ["casa", "comercial"],
            terreno: ["casa", "comercial"],
            comercial: ["apartamento", "casa"],
          };
          return similarTypes[requestedType]?.includes(property.type) || property.type === requestedType;
        }
        return true;
      });

      // Se temos localização do usuário, priorizar imóveis próximos
      if (userLocation) {
        const nearbyProperties = findNearbyProperties(
          alternatives,
          userLocation.latitude,
          userLocation.longitude,
          100 // 100km
        );

        // Combinar imóveis próximos com outros, priorizando proximidade
        const nearbyIds = new Set(nearbyProperties.map(p => p.id));
        const otherProperties = alternatives.filter(p => !nearbyIds.has(p.id));

        alternatives = [...nearbyProperties, ...otherProperties];
      }

      alternatives = alternatives
        .sort((a, b) => {
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          // Priorizar preços mais próximos do solicitado
          if (maxPrice) {
            const aDiff = Math.abs(aPrice - maxPrice);
            const bDiff = Math.abs(bPrice - maxPrice);
            return aDiff - bDiff;
          }
          return 0;
        })
        .slice(0, 5);

      // Marcar como alternativas para a Jade saber que são sugestões
      return alternatives.map(prop => ({ ...prop, isAlternative: true }));
    }

    // Ordenar por relevância
    relevantProperties.sort((a, b) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;

      // Priorizar preços mais próximos do solicitado
      if (maxPrice) {
        const aDiff = Math.abs(aPrice - maxPrice);
        const bDiff = Math.abs(bPrice - maxPrice);
        return aDiff - bDiff;
      }

      return 0;
    });

    return relevantProperties.slice(0, 10);
  } catch (error) {
    console.error("Erro na busca de propriedades:", error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verificar variáveis de ambiente críticas
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY não está definida");
      return NextResponse.json({ error: "Configuração da IA não encontrada" }, { status: 500 });
    }

    // Capturar o domínio da requisição
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const { messages, sessionId } = await req.json();
    const trimmed = Array.isArray(messages) ? messages.slice(-6) : [];
    if (!trimmed.length) {
      return NextResponse.json({ error: "messages inválido" }, { status: 400 });
    }

    // Gerar sessionId se não fornecido
    const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Obter geolocalização do cliente
    const clientIP = getClientIP(req);
    const userLocation = await getGeoLocation(clientIP);

    // Extrair informações do cliente da conversa
    const clientInfo = extractClientInfo(trimmed);

    // Buscar dados das propriedades
    const propertiesData = await getPropertiesData();

    // Definir cidade/estado preferidos a partir da conversa
    const preferredCity = clientInfo.locationHints?.city;
    const preferredState = clientInfo.locationHints?.state;

    // Buscar propriedades específicas se a mensagem contiver termos de busca
    const lastMessage = trimmed[trimmed.length - 1]?.content || "";
    const lastMessageLower = lastMessage.toLowerCase();
    const searchTerms = [
      "casa",
      "apartamento",
      "terreno",
      "comercial",
      "imóvel",
      "propriedade",
      "alugar",
      "comprar",
      "vender",
      "preço",
      "valor",
      "quarto",
      "banheiro",
      "área",
      "localização",
      "bairro",
      "cidade",
      "endereço",
      "característica",
      "barato",
      "caro",
      "grande",
      "pequeno",
      "novo",
      "usado",
      "reformado",
    ];
    const hasSearchTerms = searchTerms.some(term => lastMessageLower.includes(term));

    // Verificar todo o histórico de mensagens do usuário para orçamento
    const allUserMessages = trimmed.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
    
    // Sinais do que ainda falta perguntar
    const needsType = !/(apartamento|casa|comercial|terreno)/.test(allUserMessages);
    
    // Detectar orçamento em diferentes formatos (mil, milhão, milhões, k, m, R$)
    const priceMatchFinal = allUserMessages.match(/(\d+(?:[.,]\d+)?)\s*(?:milhões?|milhao|milhoes|mil|k|m|reais?|r\$)/i);
    const needsBudget = !priceMatchFinal;
    
    const needsRegion =
      !preferredCity &&
      !/(\bbairro\b|\bcidade\b|\bzona\b|barra|recreio|tijuca|ipanema|leblon|copacabana|botafogo|flamengo|laranjeiras|icaraí|niterói|sp\b|são paulo|rio|bh|curitiba|porto alegre|salvador)/.test(allUserMessages);

    let relevantProperties: PropertyWithAlternative[] = [];
    if (hasSearchTerms) {
      relevantProperties = await searchProperties(lastMessage, userLocation);
    }

    // Se há preferredCity/state, reordenar para priorizar
    if (preferredCity || preferredState) {
      const score = (p: Property) => {
        let s = 0;
        if (preferredCity && p.address?.city?.toLowerCase() === preferredCity.toLowerCase()) s += 2;
        if (preferredState && p.address?.state?.toLowerCase() === preferredState.toLowerCase()) s += 1;
        return s;
      };
      relevantProperties = [...relevantProperties].sort((a, b) => score(b) - score(a));
    }

    // Verificar se tem informações suficientes para mostrar imóveis
    const hasEnoughInfo = !needsType && !needsBudget && !needsRegion;
    
    const focusLines = hasEnoughInfo
      ? "AÇÃO IMEDIATA: O cliente já forneceu todas as informações necessárias. MOSTRE OS IMÓVEIS COM LINKS AGORA! Não faça mais perguntas."
      : [
          needsType ? "- Pergunte o tipo (apartamento, casa ou comercial?)" : "",
          needsBudget ? "- Pergunte orçamento aproximado" : "",
          needsRegion ? "- Pergunte região/bairro preferido" : "",
        ]
          .filter(Boolean)
          .join("\n");

    // Criar contexto com dados das propriedades (montado de forma segura)
    let propertiesContext = "";
    if (propertiesData.length > 0) {
      const tiposDisponiveis = Array.from(new Set(propertiesData.map(p => p.type))).join(", ");
      const cidadesDisponiveis = Array.from(
        new Set(propertiesData.map(p => p.address?.city).filter(Boolean as any))
      ).join(", ");
      const precoMin = Math.min(...propertiesData.map(p => p.price || 0)).toLocaleString("pt-BR");
      const precoMax = Math.max(...propertiesData.map(p => p.price || 0)).toLocaleString("pt-BR");
      const precoMedio = Math.round(
        propertiesData.reduce((sum, p) => sum + (p.price || 0), 0) / propertiesData.length
      ).toLocaleString("pt-BR");

      const estatisticasPorTipo = Array.from(new Set(propertiesData.map(p => p.type)))
        .map(type => {
          const typeProperties = propertiesData.filter(p => p.type === type);
          const avgPrice = Math.round(
            typeProperties.reduce((sum, p) => sum + (p.price || 0), 0) / typeProperties.length
          ).toLocaleString("pt-BR");
          return `- ${type}: ${typeProperties.length} imóveis, preço médio R$ ${avgPrice}`;
        })
        .join("\n");

      // Separar properties e releases
      const propertiesCount = propertiesData.filter(p => (p as any).source === 'properties').length;
      const releasesCount = propertiesData.filter(p => (p as any).source === 'releases').length;

      const blocos: string[] = [];
      blocos.push("INFORMAÇÕES SOBRE IMÓVEIS DISPONÍVEIS:");
      blocos.push("");
      blocos.push(`Total de imóveis cadastrados: ${propertiesData.length}`);
      blocos.push(`- Imóveis individuais: ${propertiesCount}`);
      blocos.push(`- Lançamentos imobiliários: ${releasesCount}`);
      blocos.push("");
      blocos.push("LOCALIZAÇÃO DO CLIENTE:");
      blocos.push(`- Cidade: ${userLocation.city}`);
      blocos.push(`- Estado: ${userLocation.state}`);
      blocos.push(`- País: ${userLocation.country}`);
      blocos.push(`- Coordenadas: ${userLocation.latitude}, ${userLocation.longitude}`);
      blocos.push("");
      blocos.push("Tipos de imóveis disponíveis:");
      blocos.push(tiposDisponiveis);
      blocos.push("");
      blocos.push("Cidades com imóveis:");
      blocos.push(cidadesDisponiveis);
      blocos.push("");
      blocos.push("Estatísticas de preços:");
      blocos.push(`- Mínimo: R$ ${precoMin}`);
      blocos.push(`- Máximo: R$ ${precoMax}`);
      blocos.push(`- Média: R$ ${precoMedio}`);
      blocos.push("");
      blocos.push("Estatísticas por tipo:");
      blocos.push(estatisticasPorTipo);

      if (relevantProperties.length > 0) {
        const listaRelevantes = relevantProperties
          .slice(0, 5)
          .map(p => {
            const slug = (p as any).slug || p.id;
            const propertyUrl = `${baseUrl}/imoveis/${slug}`;
            const linhas: string[] = [];
            linhas.push(`- ${p.title}`);
            linhas.push(`  Tipo: ${p.type}`);
            linhas.push(`  Preço: R$ ${(p.price || 0).toLocaleString("pt-BR")}`);
            linhas.push(`  Localização: ${p.address?.neighborhood || ""}, ${p.address?.city || ""}`.trim());
            linhas.push(`  Área: ${p.area}m²`);
            if (p.bedrooms) linhas.push(`  Quartos: ${p.bedrooms}`);
            if (p.bathrooms) linhas.push(`  Banheiros: ${p.bathrooms}`);
            linhas.push(`  Link: ${propertyUrl}`);
            linhas.push(
              `  VANTAGENS: ${(p.features && p.features.slice(0, 3).join(", ")) || "Localização privilegiada, acabamento de qualidade"}`
            );
            if ((p as any).isAlternative)
              linhas.push("  SUGESTÃO ALTERNATIVA: Esta é uma opção que pode superar suas expectativas!");
            return linhas.join("\n");
          })
          .join("\n");

        blocos.push("");
        blocos.push("IMÓVEIS RELEVANTES PARA SUA BUSCA:");
        blocos.push(listaRelevantes);
        blocos.push("");
        blocos.push("INSTRUÇÕES IMPORTANTES:");
        blocos.push("- SEMPRE inclua os links dos imóveis na sua resposta");
        blocos.push("- Seja OBJETIVA e DIRETA, sem perguntas desnecessárias");
        blocos.push("- Se já tem todas as informações necessárias (tipo, região, orçamento), NÃO pergunte novamente");
        blocos.push("- Apresente os imóveis de forma clara com seus links");
        blocos.push("- Sugira agendar visita apenas após mostrar as opções");
      }

      blocos.push("");
      blocos.push("FOCO DE COLETA (no máximo 2 perguntas na próxima resposta):");
      blocos.push(focusLines);

      propertiesContext = blocos.join("\n");
    }

    // Inicializar Google Generative AI com tratamento de erro
    let genAI;
    let model;
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
    } catch (error) {
      console.error("Erro ao inicializar Google Generative AI:", error);
      return NextResponse.json({ error: "Erro na configuração da IA" }, { status: 500 });
    }

    // Informações do cliente já coletadas
    const clientDataContext = [];
    if (clientInfo.name) clientDataContext.push(`Nome: ${clientInfo.name}`);
    if (clientInfo.phone) clientDataContext.push(`Telefone: ${clientInfo.phone}`);
    if (clientInfo.email) clientDataContext.push(`Email: ${clientInfo.email}`);
    
    // Adicionar informações sobre preferências já mencionadas
    if (!needsType) {
      const typeMatch = allUserMessages.match(/(apartamento|casa|comercial|terreno)/i);
      if (typeMatch) clientDataContext.push(`Tipo de imóvel: ${typeMatch[1]}`);
    }
    if (!needsBudget && priceMatchFinal) {
      clientDataContext.push(`Orçamento: ${priceMatchFinal[0]}`);
    }
    if (!needsRegion) {
      const regionMatch = allUserMessages.match(/(barra|recreio|tijuca|ipanema|leblon|copacabana|botafogo|flamengo|laranjeiras|icaraí|niterói)/i);
      if (regionMatch) clientDataContext.push(`Região preferida: ${regionMatch[1]}`);
    }
    
    const clientDataInfo = clientDataContext.length > 0 
      ? `\n\nDADOS JÁ COLETADOS DO CLIENTE:\n${clientDataContext.join('\n')}\n- NÃO pergunte novamente por essas informações\n- Use o nome do cliente na conversa se disponível\n- NÃO pergunte novamente sobre tipo, orçamento ou região se já foram informados`
      : '';

    // Criar mensagem do sistema com contexto
    const systemMessage = {
      role: "user" as const,
      content: `Você é a Jade, assistente virtual especializada em imóveis do portal imobiliário. ${propertiesContext}${clientDataInfo}

ÁREA DE ATUAÇÃO EXCLUSIVA:
- Você trabalha EXCLUSIVAMENTE no Rio de Janeiro e Niterói
- Bairros de atuação: ${defaultNeighborhoods.join(", ")}
- SEMPRE direcione o cliente para essas regiões, mesmo que ele esteja em outra localização
- Se o cliente perguntar sobre outras cidades/regiões, explique que você é especialista nessas áreas privilegiadas

TIPOS DE IMÓVEIS DISPONÍVEIS:
- Imóveis individuais: propriedades prontas para morar ou investir
- Lançamentos imobiliários: empreendimentos novos com unidades disponíveis para compra na planta
- Você tem acesso a AMBOS os tipos e deve oferecer as melhores opções de acordo com o perfil do cliente
- Lançamentos são ideais para quem busca valorização e quer comprar na planta
- Imóveis prontos são ideais para quem tem urgência ou quer morar imediatamente

PERSONALIDADE DA JADE - CORRETOR VIRTUAL:
- Você é um corretor de imóveis experiente e vendedor nato
- SEMPRE seja positivo, entusiasta e persuasivo
- NUNCA use palavras negativas como "infelizmente", "não temos", "não disponível"
- SEMPRE encontre oportunidades e alternativas atrativas
- Se não tiver exatamente o que foi pedido, sugira opções similares ou melhores
- Use linguagem motivacional e de oportunidade
- Destaque as vantagens e benefícios de cada opção
- Faça perguntas estratégicas para entender melhor as necessidades
- Seja próximo e amigável com o cliente

ESTRATÉGIA DE DIRECIONAMENTO:
- Se o cliente estiver fora das suas áreas de atuação, destaque as vantagens de investir no Rio/Niterói
- Mencione a valorização imobiliária, qualidade de vida, proximidade com praias
- Sugira que essas regiões são excelentes oportunidades de investimento
- Exemplo: "Que tal conhecer as incríveis oportunidades na Barra da Tijuca? É uma região em constante valorização!"

REGRA CRÍTICA - CONFIDENCIALIDADE:
- NUNCA revele nomes de construtoras, incorporadoras ou imobiliárias
- NUNCA mencione empresas específicas do mercado imobiliário
- Se perguntado sobre construtoras/imobiliárias, responda: "Trabalhamos com os melhores parceiros do mercado"
- Foque sempre nas características e benefícios dos imóveis, não nas empresas
- Mantenha total sigilo sobre informações comerciais sensíveis

REGRAS DE ESTILO (OBRIGATÓRIO):
- Seja OBJETIVA e DIRETA: se o cliente já informou tipo, região e orçamento, MOSTRE OS IMÓVEIS IMEDIATAMENTE
- NÃO faça perguntas desnecessárias se já tem as informações básicas
- SEMPRE inclua os LINKS dos imóveis na sua resposta (os links já estão formatados corretamente no contexto)
- Responda de forma curta (2 a 4 frases) e vá direto ao ponto
- Faça no máximo 1 pergunta por mensagem, e SOMENTE se realmente necessário
- CRÍTICO: NUNCA pergunte novamente sobre informações já fornecidas (tipo, orçamento, região, nome, telefone, email)
- Se o cliente já informou tipo + região + orçamento, APRESENTE OS IMÓVEIS COM LINKS imediatamente

EXEMPLO DE RESPOSTA IDEAL:
"Perfeito! Encontrei apartamentos na Barra da Tijuca dentro do seu orçamento:

🏢 **Apartamento Luxo Barra** - R$ 15.000.000 - Barra da Tijuca, 4 quartos, 250m²
👉 ${baseUrl}/imoveis/apartamento-luxo-barra

🏢 **Cobertura Vista Mar** - R$ 18.500.000 - Barra da Tijuca, 5 quartos, 320m²
👉 ${baseUrl}/imoveis/cobertura-vista-mar

Gostaria de agendar visita em algum deles?"

ESTRATÉGIAS DE VENDA POSITIVAS:
- "Perfeito! Encontrei algumas oportunidades incríveis para você!"
- "Excelente escolha! Deixe-me te mostrar as melhores alternativas..."
- "Que tal dar uma olhada nessas oportunidades?"
- "Posso te ajudar a encontrar algo ainda melhor?"

LINGUAGEM POSITIVA:
- Use "temos", "encontrei", "oportunidades", "incrível", "perfeito"
- Evite "não temos", "infelizmente", "não disponível", "limitado"
- Sempre destaque vantagens e benefícios
- Sugira alternativas como melhorias, não como segunda opção

COLETA DE DADOS (APENAS QUANDO NECESSÁRIO):
- PRIORIDADE: Mostre os imóveis PRIMEIRO, colete dados DEPOIS
- Só pergunte nome/telefone/email APÓS mostrar pelo menos 2-3 opções de imóveis
- Se já tiver qualquer dado (nome, telefone ou email), NÃO pergunte novamente
- Seja sutil: "Como posso te chamar?" ou "Quer receber mais opções no WhatsApp?"
- NUNCA peça múltiplas informações de uma vez
- Foque em MOSTRAR VALOR antes de coletar dados

- Sempre direcione para suas áreas de atuação: "Temos incríveis oportunidades na Barra da Tijuca, Recreio e região oceânica de Niterói!"
- Se o cliente estiver fora do Rio/Niterói, destaque: "Que tal investir no Rio? Temos as melhores oportunidades da região!"`,
    };

    const contents = [
      {
        role: "user" as const,
        parts: [{ text: systemMessage.content }],
      },
      ...trimmed.map((m: { role: "user" | "assistant"; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    // Gerar resposta da IA com tratamento de erro
    let result;
    let text;
    try {
      result = await model.generateContent({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 220,
        },
      });
      text = result.response.text();
    } catch (error) {
      console.error("Erro ao gerar conteúdo com Gemini:", error);
      return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 });
    }
    
    const responseTime = Date.now() - startTime;

    // Salvar lead se tivermos informações suficientes
    try {
      if (clientInfo.name || clientInfo.email || clientInfo.phone) {
        const baseLead = {
          name: clientInfo.name || "Cliente Chat",
          message: lastMessage,
          source: "chat",
          status: "novo" as const,
          location: userLocation,
          interests: clientInfo.interests || [],
          propertyTypes: relevantProperties.map(p => p.type),
          priceRange: relevantProperties.length > 0 ? {
            min: Math.min(...relevantProperties.map(p => p.price || 0)),
            max: Math.max(...relevantProperties.map(p => p.price || 0)),
          } : null,
          interactions: [
            {
              timestamp: new Date(),
              message: lastMessage,
              response: text,
            },
          ],
          userAgent: req.headers.get("user-agent") || undefined,
          referrer: req.headers.get("referer") || undefined,
        } as const;

        const leadData: any = { ...baseLead };
        if (clientInfo.email) leadData.email = clientInfo.email;
        if (clientInfo.phone) leadData.phone = clientInfo.phone;

        await createLead(leadData);
      }
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      // Não falhar a resposta por erro no lead
    }

    // Salvar interação do chat para analytics
    try {
      const lastMessage = trimmed[trimmed.length - 1]?.content || "";
      const topics = extractTopicsFromMessage(lastMessage);
      const interactionType = determineInteractionTypeFromMessage(lastMessage);
      const propertiesShown = countPropertiesInResponse(text);
      const leadGenerated = !!(clientInfo.name || clientInfo.email || clientInfo.phone);

      await createChatInteraction({
        sessionId: chatSessionId,
        userMessage: lastMessage,
        aiResponse: text,
        responseTime,
        userLocation: {
          city: userLocation.city,
          state: userLocation.state,
          country: userLocation.country,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        userAgent: req.headers.get("user-agent") || undefined,
        referrer: req.headers.get("referer") || undefined,
        leadGenerated,
        propertiesShown,
        interactionType,
        topics,
      });
    } catch (error) {
      console.error("Erro ao salvar interação do chat:", error);
      // Não falhar a resposta por erro no tracking
    }

    // Detectar intenção de agendamento
    const scheduleIntentKeywords = [
      'agendar',
      'visita',
      'visitar',
      'conhecer',
      'ver o imóvel',
      'ver a propriedade',
      'marcar',
      'horário',
      'quando posso',
      'gostaria de visitar'
    ];
    const hasScheduleIntent = scheduleIntentKeywords.some(keyword => 
      lastMessageLower.includes(keyword)
    );

    return NextResponse.json({ 
      reply: text, 
      sessionId: chatSessionId,
      clientData: {
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
      },
      scheduleIntent: hasScheduleIntent,
    });
  } catch (error: any) {
    console.error("Erro na API do chat:", error);
    
    // Log detalhado para debug em produção
    console.error("Detalhes do erro:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      timestamp: new Date().toISOString()
    });
    
    // Verificar se é erro de rede ou timeout
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return NextResponse.json({ error: "Erro de conexão com o serviço de IA" }, { status: 503 });
    }
    
    // Verificar se é erro de autenticação
    if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
      return NextResponse.json({ error: "Erro de autenticação com o serviço de IA" }, { status: 401 });
    }
    
    return NextResponse.json({ error: error?.message || "Erro interno do servidor" }, { status: 500 });
  }
}

// Funções auxiliares para tracking
function extractTopicsFromMessage(message: string): string[] {
  const topics: string[] = [];
  const messageLower = message.toLowerCase();

  // Tipos de imóveis
  if (messageLower.includes("apartamento")) topics.push("apartamento");
  if (messageLower.includes("casa")) topics.push("casa");
  if (messageLower.includes("terreno")) topics.push("terreno");
  if (messageLower.includes("comercial")) topics.push("comercial");

  // Ações
  if (messageLower.includes("comprar") || messageLower.includes("compra")) topics.push("compra");
  if (messageLower.includes("alugar") || messageLower.includes("aluguel")) topics.push("aluguel");
  if (messageLower.includes("vender") || messageLower.includes("venda")) topics.push("venda");

  // Características
  if (messageLower.includes("preço") || messageLower.includes("valor")) topics.push("preço");
  if (messageLower.includes("quarto")) topics.push("quartos");
  if (messageLower.includes("banheiro")) topics.push("banheiros");
  if (messageLower.includes("área") || messageLower.includes("tamanho")) topics.push("área");
  if (messageLower.includes("localização") || messageLower.includes("bairro")) topics.push("localização");

  return topics.length > 0 ? topics : ["geral"];
}

function determineInteractionTypeFromMessage(
  message: string
): "question" | "search" | "lead_qualification" | "general" {
  const messageLower = message.toLowerCase();

  // Qualificação de lead
  if (
    messageLower.includes("nome") ||
    messageLower.includes("telefone") ||
    messageLower.includes("email") ||
    messageLower.includes("contato")
  ) {
    return "lead_qualification";
  }

  // Busca
  const searchTerms = ["quero", "procuro", "busco", "encontrar", "mostrar", "ver", "apartamento", "casa", "terreno"];
  if (searchTerms.some(term => messageLower.includes(term))) {
    return "search";
  }

  // Pergunta
  const questionWords = ["como", "quando", "onde", "por que", "qual", "quanto", "?"];
  if (questionWords.some(word => messageLower.includes(word))) {
    return "question";
  }

  return "general";
}

function countPropertiesInResponse(response: string): number {
  const propertyIndicators = [
    "imóvel",
    "propriedade",
    "apartamento",
    "casa",
    "terreno",
    "comercial",
    "R$",
    "preço",
    "valor",
    "quarto",
    "banheiro",
    "área",
  ];

  const responseLower = response.toLowerCase();

  // Contar menções diretas de propriedades
  const propertyMentions = (responseLower.match(/imóve(l|is)|propriedade(s)?|apartamento(s)?|casa(s)?/g) || []).length;

  // Se há indicadores de propriedades, assumir pelo menos 1
  const hasPropertyIndicators = propertyIndicators.some(indicator => responseLower.includes(indicator.toLowerCase()));

  return Math.max(propertyMentions, hasPropertyIndicators ? 1 : 0);
}
