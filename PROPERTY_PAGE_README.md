# Página de Lista de Imóveis

Esta página foi implementada para exibir uma lista completa de imóveis da coleção "properties" do Firebase, com funcionalidades de busca, filtros e paginação.

## Funcionalidades Implementadas

### 🔍 Busca e Filtros
- **Busca por texto**: Pesquisa por título, bairro ou cidade
- **Filtros avançados**:
  - Tipo de imóvel (casa, apartamento, terreno, comercial)
  - Faixa de preço (mínimo e máximo)
  - Número de quartos e banheiros
  - Área mínima
  - Cidade e bairro específicos

### 📄 Paginação
- Exibição de 12 imóveis por página
- Navegação entre páginas
- Indicadores de página atual e total

### 🎨 Interface
- Design responsivo (mobile-first)
- Cards de imóveis com informações completas
- Estados de loading e erro
- Mensagem quando nenhum imóvel é encontrado

## Estrutura de Arquivos

```
src/
├── app/
│   ├── api/properties/
│   │   └── route.ts              # API para listar propriedades
│   └── property/
│       └── page.tsx              # Página principal de imóveis
├── components/
│   ├── PropertyCard.tsx          # Card individual de imóvel
│   ├── PropertyFilters.tsx       # Componente de filtros
│   └── common/
│       └── pagination.tsx        # Componente de paginação
└── hooks/queries/
    └── use-properties.ts         # Hook para buscar propriedades
```

## Como Usar

### 1. Acessar a Página
A página está disponível em `/property` ou `/imoveis` (via rewrite no next.config.js)

### 2. Buscar Imóveis
- Use a barra de busca para pesquisar por texto
- Clique em "Filtros" para abrir opções avançadas
- Aplique os filtros desejados
- Use "Limpar" para resetar todos os filtros

### 3. Navegar
- Use a paginação na parte inferior para navegar entre páginas
- A página rola automaticamente para o topo ao mudar de página

## API Endpoint

### GET /api/properties

**Parâmetros de Query:**
- `query` - Busca por texto
- `type` - Tipo de imóvel
- `minPrice` - Preço mínimo
- `maxPrice` - Preço máximo
- `bedrooms` - Número mínimo de quartos
- `bathrooms` - Número mínimo de banheiros
- `minArea` - Área mínima
- `city` - Cidade
- `neighborhood` - Bairro
- `page` - Página atual (padrão: 1)
- `limit` - Itens por página (padrão: 12)

**Resposta:**
```json
{
  "properties": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Estrutura de Dados

Cada imóvel deve ter a seguinte estrutura no Firebase:

```typescript
interface Property {
  id: string
  title: string
  description: string
  price: number
  type: 'casa' | 'apartamento' | 'terreno' | 'comercial'
  bedrooms?: number
  bathrooms?: number
  area: number
  address: {
    street: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  images: string[]
  features: string[]
  contact: {
    name: string
    phone: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
}
```

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado e cache
- **Firebase Firestore** - Banco de dados
- **Lucide React** - Ícones

## Próximos Passos

- [ ] Implementar paginação com cursor (startAfter) para melhor performance
- [ ] Adicionar ordenação por preço, data, etc.
- [ ] Implementar favoritos
- [ ] Adicionar filtros por características especiais
- [ ] Implementar busca por geolocalização
- [ ] Adicionar comparação de imóveis
