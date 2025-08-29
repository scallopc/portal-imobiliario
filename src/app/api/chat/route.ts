import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { adminDb } from "@/lib/firebase-admin";
import { Property } from "@/types";
import { 
  getClientIP, 
  getGeoLocation, 
  findNearbyProperties, 
  extractClientInfo,
  type ClientInfo,
  type GeoLocation 
} from "@/lib/geo-utils";
import { createLead } from "@/actions/create-lead";

interface PropertyWithAlternative extends Property {
  isAlternative?: boolean;
}

// Função para buscar propriedades do Firebase
async function getPropertiesData(): Promise<Property[]> {
  try {
    const snapshot = await adminDb.collection('properties').limit(50).get();
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    })) as Property[];
    
    return properties;
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error);
    return [];
  }
}

// Função para buscar propriedades por filtros específicos
async function searchProperties(query: string, userLocation?: GeoLocation): Promise<PropertyWithAlternative[]> {
  try {
    const queryLower = query.toLowerCase();
    const allProperties = await getPropertiesData();
    
    // Extrair informações da query
    const priceMatch = queryLower.match(/(\d+)\s*(?:mil|k|reais?|r\$)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) * 1000 : null;
    const minPrice = priceMatch ? Math.max(0, parseInt(priceMatch[1]) * 1000 - 50000) : null;
    
    // Buscar por tipo de imóvel
    const propertyTypes = ['casa', 'apartamento', 'terreno', 'comercial'];
    const requestedType = propertyTypes.find(type => queryLower.includes(type));
    
    // Buscar por características
    const bedroomsMatch = queryLower.match(/(\d+)\s*quarto/);
    const requestedBedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : null;
    
    // Busca inteligente por múltiplos campos
    const relevantProperties = allProperties.filter(property => {
      const title = property.title?.toLowerCase() || '';
      const description = property.description?.toLowerCase() || '';
      const city = property.address?.city?.toLowerCase() || '';
      const neighborhood = property.address?.neighborhood?.toLowerCase() || '';
      const type = property.type?.toLowerCase() || '';
      const price = property.price || 0;
      
      // Busca por texto
      const textMatch = (
        title.includes(queryLower) ||
        description.includes(queryLower) ||
        city.includes(queryLower) ||
        neighborhood.includes(queryLower) ||
        type.includes(queryLower)
      );
      
      // Busca por preço
      const priceMatch = maxPrice ? (price <= maxPrice && price >= (minPrice || 0)) : false;
      
      // Busca por tipo específico
      const typeMatch = requestedType ? type === requestedType : false;
      
      // Busca por quartos
      const bedroomMatch = requestedBedrooms ? (property.bedrooms && property.bedrooms >= requestedBedrooms) : false;
      
      // Busca por qualificadores
      const qualifierMatch = (
        (queryLower.includes('barato') && price < 200000) ||
        (queryLower.includes('caro') && price > 500000) ||
        (queryLower.includes('grande') && property.area > 150) ||
        (queryLower.includes('pequeno') && property.area < 80)
      );
      
      return textMatch || priceMatch || typeMatch || bedroomMatch || qualifierMatch;
    });
    
    // Se não encontrou resultados exatos, buscar alternativas atrativas
    if (relevantProperties.length === 0) {
      let alternatives = allProperties
        .filter(property => {
          const price = property.price || 0;
          // Buscar imóveis em faixa de preço similar ou um pouco acima
          if (maxPrice) {
            return price <= maxPrice * 1.5; // Até 50% acima do preço solicitado
          }
          // Se não especificou preço, buscar por tipo similar
          if (requestedType) {
            const similarTypes: Record<string, string[]> = {
              'casa': ['apartamento', 'terreno'],
              'apartamento': ['casa', 'comercial'],
              'terreno': ['casa', 'comercial'],
              'comercial': ['apartamento', 'casa']
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
    console.error('Erro na busca de propriedades:', error);
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const trimmed = Array.isArray(messages) ? messages.slice(-6) : [];
    if (!trimmed.length) {
      return NextResponse.json({ error: "messages inválido" }, { status: 400 });
    }

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
    const lastMessage = trimmed[trimmed.length - 1]?.content || '';
    const lastMessageLower = lastMessage.toLowerCase();
    const searchTerms = [
      'casa', 'apartamento', 'terreno', 'comercial', 'imóvel', 'propriedade',
      'alugar', 'comprar', 'vender', 'preço', 'valor', 'quarto', 'banheiro',
      'área', 'localização', 'bairro', 'cidade', 'endereço', 'característica',
      'barato', 'caro', 'grande', 'pequeno', 'novo', 'usado', 'reformado'
    ];
    const hasSearchTerms = searchTerms.some(term => 
      lastMessageLower.includes(term)
    );

    // Sinais do que ainda falta perguntar
    const needsType = !/(apartamento|casa|comercial|terreno)/.test(lastMessageLower);
    const priceMatchFinal = lastMessageLower.match(/(\d+)\s*(?:mil|k|reais?|r\$)/i);
    const needsBudget = !priceMatchFinal;
    const needsRegion = !preferredCity && !/(\bbairro\b|\bcidade\b|\bzona\b|sp\b|são paulo|rio|bh|curitiba|porto alegre|salvador)/.test(lastMessageLower);

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

    // Criar contexto com dados das propriedades
    const propertiesContext = propertiesData.length > 0 ? `
INFORMAÇÕES SOBRE IMÓVEIS DISPONÍVEIS:

Total de imóveis cadastrados: ${propertiesData.length}

LOCALIZAÇÃO DO CLIENTE:
- Cidade: ${userLocation.city}
- Estado: ${userLocation.state}
- País: ${userLocation.country}
- Coordenadas: ${userLocation.latitude}, ${userLocation.longitude}

Tipos de imóveis disponíveis:
${Array.from(new Set(propertiesData.map(p => p.type))).join(', ')}

Cidades com imóveis:
${Array.from(new Set(propertiesData.map(p => p.address?.city).filter(Boolean))).join(', ')}

Estatísticas de preços:
- Mínimo: R$ ${Math.min(...propertiesData.map(p => p.price || 0)).toLocaleString('pt-BR')}
- Máximo: R$ ${Math.max(...propertiesData.map(p => p.price || 0)).toLocaleString('pt-BR')}
- Média: R$ ${Math.round(propertiesData.reduce((sum, p) => sum + (p.price || 0), 0) / propertiesData.length).toLocaleString('pt-BR')}

Estatísticas por tipo:
${Array.from(new Set(propertiesData.map(p => p.type))).map(type => {
  const typeProperties = propertiesData.filter(p => p.type === type);
  const avgPrice = Math.round(typeProperties.reduce((sum, p) => sum + (p.price || 0), 0) / typeProperties.length);
  return `- ${type}: ${typeProperties.length} imóveis, preço médio R$ ${avgPrice.toLocaleString('pt-BR')}`;
}).join('\n')}

${relevantProperties.length > 0 ? `
IMÓVEIS RELEVANTES PARA SUA BUSCA:
${relevantProperties.slice(0, 5).map(p => `
- ${p.title}
  Tipo: ${p.type}
  Preço: R$ ${p.price?.toLocaleString('pt-BR')}
  Localização: ${p.address?.neighborhood}, ${p.address?.city}
  Área: ${p.area}m²
  ${p.bedrooms ? `Quartos: ${p.bedrooms}` : ''}
  ${p.bathrooms ? `Banheiros: ${p.bathrooms}` : ''}
  ${p.description ? `Descrição: ${p.description.substring(0, 100)}...` : ''}
  VANTAGENS: ${p.features?.slice(0, 3).join(', ') || 'Localização privilegiada, acabamento de qualidade'}
  CONTATO: ${p.contact?.name || 'Corretor especializado'} - ${p.contact?.phone || '(11) 99999-9999'}
  ${p.isAlternative ? 'SUGESTÃO ALTERNATIVA: Esta é uma opção que pode superar suas expectativas!' : ''}
`).join('\n')}

DICAS DE VENDA:
- Destaque a localização e facilidades próximas
- Mencione possibilidades de financiamento
- Sugira agendar visita para conhecer pessoalmente
- Ofereça opções de parcelamento
- Enfatize a oportunidade única
- Se for alternativa, destaque como pode ser melhor que o solicitado
- Sempre seja positivo e entusiasta sobre todas as opções
` : ''}

FOCO DE COLETA (no máximo 2 perguntas na próxima resposta):
${[needsType ? '- Pergunte o tipo (apartamento, casa ou comercial?)' : '', needsBudget ? '- Pergunte orçamento aproximado' : '', needsRegion ? '- Pergunte região/bairro preferido' : ''].filter(Boolean).join('\n')}
`