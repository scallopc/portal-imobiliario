export const TARGET_NEIGHBORHOODS = {
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

export const ALL_NEIGHBORHOODS = [
  ...TARGET_NEIGHBORHOODS.rio_de_janeiro.zona_oeste,
  ...TARGET_NEIGHBORHOODS.niteroi.zona_sul,
  ...TARGET_NEIGHBORHOODS.niteroi.regiao_oceanica
];

export const REAL_ESTATE_SITES = [
  // Grandes portais
  'vivareal.com.br',
  'zapimoveis.com.br',
  'olx.com.br',
  'imovelweb.com.br',
  'quintoandar.com.br',
  
  // Construtoras principais
  'mrv.com.br',
  'cyrela.com.br',
  'tecnisa.com.br',
  'rodobens.com.br',
  'direcional.com.br',
  'pdg.com.br',
  'rossi.com.br',
  'gafisa.com.br',
  
  // Imobiliárias regionais RJ/Niterói
  'lopes.com.br',
  'apsa.com.br',
  'goldenimoveis.com.br',
  'orlanet.com.br',
  'barraworld.com.br'
];

export const SEARCH_KEYWORDS = [
  'apartamento',
  'casa',
  'cobertura',
  'duplex',
  'studio',
  'kitnet',
  'loft',
  'terreno',
  'sala comercial',
  'loja'
];
