# Jade Chat - IA Integrada com Dados de Imóveis

A Jade é a assistente virtual do portal imobiliário, agora integrada com dados reais da coleção "properties" do Firebase para fornecer respostas mais precisas e úteis.

## 🧠 Funcionalidades da Jade

### 📊 **Conhecimento Baseado em Dados Reais**
- Acessa automaticamente a coleção "properties" do Firebase
- Conhece todos os imóveis cadastrados no sistema
- Fornece estatísticas precisas sobre preços, tipos e localizações
- Sugere imóveis relevantes baseados na conversa

### 🔍 **Busca Inteligente**
A Jade detecta automaticamente quando o usuário está perguntando sobre imóveis e busca informações relevantes:

**Termos que ativam a busca:**
- Tipos: casa, apartamento, terreno, comercial
- Ações: alugar, comprar, vender
- Características: preço, valor, quarto, banheiro, área
- Localização: bairro, cidade, endereço
- Qualificadores: barato, caro, grande, pequeno, novo, usado

### 📈 **Estatísticas Fornecidas**
Para cada conversa, a Jade recebe:
- Total de imóveis cadastrados
- Tipos de imóveis disponíveis
- Cidades com imóveis
- Faixa de preços (mínimo, máximo, média)
- Estatísticas por tipo de imóvel
- Imóveis relevantes para a busca específica

## 🎯 **Exemplos de Interação**

### Pergunta: "Quais casas vocês têm?"
**Jade responde com:**
- "Temos algumas casas incríveis disponíveis! Deixe-me te mostrar as melhores opções..."
- Destaque das características especiais
- Sugestão de agendar visita
- Perguntas estratégicas sobre preferências

### Pergunta: "Tem algo barato em São Paulo?"
**Jade responde com:**
- "Perfeito! Encontrei algumas oportunidades incríveis em São Paulo!"
- Alternativas em diferentes faixas de preço
- Destaque de vantagens da localização
- Sugestão de financiamento ou parcelamento
- Agendamento de visita personalizada

### Pergunta: "Quero um apartamento com 3 quartos"
**Jade responde com:**
- "Perfeito! Tenho algumas opções que vão te encantar..."
- Apartamentos com 3+ quartos e similares
- Destaque de acabamentos e facilidades
- Agendamento de visita personalizada

## 🔧 **Como Funciona Tecnicamente**

### 1. **Detecção de Intenção**
```typescript
const searchTerms = [
  'casa', 'apartamento', 'terreno', 'comercial', 'imóvel', 'propriedade',
  'alugar', 'comprar', 'vender', 'preço', 'valor', 'quarto', 'banheiro',
  'área', 'localização', 'bairro', 'cidade', 'endereço', 'característica',
  'barato', 'caro', 'grande', 'pequeno', 'novo', 'usado', 'reformado'
];
```

### 2. **Busca Inteligente**
A Jade busca por múltiplos campos:
- Título e descrição
- Cidade e bairro
- Tipo de imóvel
- Preço
- Características (quartos, banheiros, área)

### 3. **Contexto Enriquecido**
```typescript
const propertiesContext = `
INFORMAÇÕES SOBRE IMÓVEIS DISPONÍVEIS:
- Total de imóveis: ${total}
- Tipos disponíveis: ${tipos}
- Faixa de preços: R$ ${min} - R$ ${max}
- Imóveis relevantes: ${relevantes}
`;
```

### 4. **Resposta Vendedora**
A Jade usa o contexto para:
- Vender os imóveis de forma persuasiva
- Sugerir alternativas atrativas
- Destaque vantagens e benefícios
- Agendar visitas e contatos diretos
- Oferecer opções de financiamento

## 🎨 **Personalidade da Jade - Corretor Virtual**

### **Características:**
- **Vendedor nato e proativo**
- **Especialista em imóveis com estratégias de venda**
- **Conhecimento baseado em dados reais**
- **Sempre oferece alternativas e opções**
- **Foca em fechar visitas e contatos**

### **Tom de Voz:**
- Positivo e entusiasta (NUNCA negativo)
- Persuasivo e motivacional
- Entusiasta sobre os imóveis
- Estratégico nas perguntas
- Sempre tenta vender e agendar visitas
- Oferece valor antes de pedir ação
- Próximo e amigável com o cliente

## 📱 **Integração com o Sistema**

### **API Endpoint:**
```
POST /api/chat
```

### **Fluxo de Dados:**
1. Usuário envia mensagem
2. Sistema detecta termos relacionados a imóveis
3. Busca dados relevantes no Firebase
4. Cria contexto enriquecido
5. Envia para IA com instruções específicas
6. Jade responde com informações precisas

### **Cache e Performance:**
- Dados são buscados a cada conversa (atualizados)
- Limite de 50 imóveis para performance
- Busca inteligente filtra resultados relevantes
- Respostas otimizadas para velocidade

## 🚀 **Benefícios**

### **Para o Usuário:**
- Respostas precisas sobre imóveis reais
- Sugestões personalizadas
- Informações atualizadas
- Experiência mais rica

### **Para o Negócio:**
- Maior engajamento
- Conversões mais qualificadas
- Redução de dúvidas básicas
- Diferencial competitivo

## 🔮 **Próximas Melhorias**

- [ ] Busca por geolocalização
- [ ] Recomendações baseadas em histórico
- [ ] Integração com favoritos
- [ ] Agendamento de visitas
- [ ] Comparação de imóveis
- [ ] Alertas de novos imóveis

## 📞 **Como Usar**

1. **Acesse o chat** no canto inferior direito
2. **Faça perguntas** sobre imóveis
3. **Receba respostas** baseadas em dados reais
4. **Siga as sugestões** da Jade
5. **Visite a página de imóveis** para mais detalhes

A Jade está sempre aprendendo e melhorando para oferecer a melhor experiência possível!
