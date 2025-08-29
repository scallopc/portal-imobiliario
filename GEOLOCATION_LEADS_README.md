# Sistema de Geolocalização e Coleta de Leads

O sistema agora detecta automaticamente a localização do cliente via IP e coleta informações de forma sutil durante a conversa com a Jade.

## 🗺️ **Geolocalização Automática**

### **Como Funciona**
1. **Detecção de IP**: Sistema identifica o IP real do cliente
2. **Geolocalização**: Converte IP em coordenadas geográficas
3. **Busca Inteligente**: Prioriza imóveis próximos à localização do cliente
4. **Personalização**: Jade usa a localização para personalizar respostas

### **Serviços Utilizados**
- **IP-API.com**: Serviço gratuito de geolocalização
- **Fallback**: Localização padrão (São Paulo) em caso de erro
- **Headers Múltiplos**: Suporte a diferentes proxies e CDNs

### **Dados Coletados**
```typescript
interface GeoLocation {
  ip: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  neighborhood?: string
  zipCode?: string
}
```

## 📊 **Coleta Sutil de Dados**

### **Extração Automática**
O sistema extrai informações do cliente durante a conversa:

**Nome:**
- "Me chamo João"
- "Sou Maria"
- "Nome é Pedro"

**Telefone:**
- (11) 99999-9999
- 11 99999-9999
- 11999999999

**Email:**
- joao@email.com
- maria@gmail.com

**Interesses:**
- Tipos de imóvel (casa, apartamento, etc.)
- Características (quarto, banheiro, área)
- Ações (alugar, comprar, investir)

### **Estratégias de Coleta**
- **Natural**: "Como posso te chamar?"
- **Contextual**: "Posso te passar o contato do corretor?"
- **Benefício**: "Posso te enviar mais detalhes por email?"
- **Localização**: "Temos ótimas opções aqui em São Paulo!"

## 🏠 **Busca por Proximidade**

### **Algoritmo de Distância**
- **Fórmula de Haversine**: Calcula distância entre coordenadas
- **Raio de Busca**: 50km por padrão, 100km para alternativas
- **Priorização**: Imóveis mais próximos aparecem primeiro

### **Exemplo de Busca**
```
Cliente em São Paulo (SP)
↓
Busca imóveis em:
- São Paulo (0-50km) - Prioridade alta
- Grande São Paulo (50-100km) - Prioridade média
- Outras cidades - Prioridade baixa
```

## 📈 **Sistema de Leads**

### **Estrutura do Lead**
```typescript
interface Lead {
  // Informações básicas
  name: string
  email: string
  phone: string
  message: string
  
  // Localização
  location: GeoLocation
  
  // Interesses e comportamento
  interests: string[]
  propertyTypes: string[]
  priceRange: { min?: number, max?: number }
  
  // Histórico
  interactions: Array<{
    timestamp: Date
    message: string
    response: string
  }>
  
  // Metadados
  source: string
  status: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'perdido'
  leadScore: number
  tags: string[]
}
```

### **Score do Lead**
Sistema calcula automaticamente a qualidade do lead:

- **Nome**: +10 pontos
- **Email**: +15 pontos
- **Telefone**: +15 pontos
- **Interesses**: +5 pontos cada
- **Tipos de imóvel**: +8 pontos cada
- **Localização**: +10 pontos
- **Interações**: +3 pontos cada

**Máximo**: 100 pontos

### **Tags Automáticas**
- `cidade:são paulo`
- `estado:sp`
- `interesse:casa`
- `tipo:apartamento`
- `faixa:média`
- `fonte:chat`

## 🔄 **Fluxo Completo**

### **1. Cliente Acessa o Chat**
```
IP: 200.147.35.1
↓
Geolocalização: São Paulo, SP
↓
Contexto para Jade
```

### **2. Conversa com Jade**
```
Cliente: "Quero uma casa até 300 mil"
↓
Extração: interesse=casa, preço=300000
↓
Busca: imóveis próximos + filtros
↓
Resposta personalizada
```

### **3. Coleta de Dados**
```
Cliente: "Me chamo João, telefone 11 99999-9999"
↓
Extração: nome=João, telefone=11999999999
↓
Lead criado automaticamente
```

### **4. Lead Salvo**
```
{
  name: "João",
  phone: "11999999999",
  location: { city: "São Paulo", state: "SP", ... },
  interests: ["casa"],
  priceRange: { max: 300000 },
  leadScore: 85,
  tags: ["cidade:são paulo", "interesse:casa", "faixa:média"]
}
```

## 🎯 **Benefícios**

### **Para o Cliente**
- **Relevância**: Imóveis próximos à localização
- **Personalização**: Respostas baseadas na cidade
- **Experiência**: Conversa natural e fluida

### **Para o Negócio**
- **Qualificação**: Leads com score automático
- **Segmentação**: Tags para campanhas específicas
- **Conversão**: Dados completos para follow-up
- **Análise**: Histórico completo de interações

## 🔧 **Configuração**

### **Variáveis de Ambiente**
```env
# Serviço de geolocalização (opcional)
GEO_API_KEY=your_api_key

# Configurações de busca
MAX_DISTANCE_KM=50
ALTERNATIVE_DISTANCE_KM=100
```

### **Personalização**
- **Raio de busca**: Ajustável por região
- **Score do lead**: Pesos configuráveis
- **Tags**: Categorias personalizáveis
- **Fallback**: Localização padrão configurável

## 📊 **Métricas e Analytics**

### **Dados Coletados**
- Taxa de conversão por localização
- Score médio dos leads
- Tempo de conversa até coleta de dados
- Efetividade por tipo de imóvel

### **Relatórios**
- Leads por cidade/estado
- Qualificação automática
- Performance da Jade por região
- ROI por fonte de lead

O sistema transforma cada conversa em uma oportunidade de negócio qualificada! 🏠📈✨
