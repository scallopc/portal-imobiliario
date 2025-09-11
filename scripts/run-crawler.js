// Script para executar o fluxo completo de crawler
require('dotenv').config()

const { PropertyCrawler } = require('./property-crawler')
const { PropertyProcessor } = require('./process-properties')

async function runFullCrawler() {
  console.log('🚀 Iniciando fluxo completo de garimpo de imóveis...\n');
  
  try {
    // Etapa 1: Crawler para extrair dados brutos
    console.log('📡 ETAPA 1: Extraindo dados de sites...');
    const crawler = new PropertyCrawler();
    await crawler.run();
    
    console.log('\n⏳ Aguardando 5 segundos antes do processamento...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Etapa 2: Processar dados brutos
    console.log('\n🔄 ETAPA 2: Processando e refinando dados...');
    const processor = new PropertyProcessor();
    await processor.run();
    
    console.log('\n🎉 Fluxo completo finalizado!');
    console.log('💡 Os imóveis estão agora disponíveis na coleção "properties"');
    
  } catch (error) {
    console.error('❌ Erro no fluxo completo:', error);
  }
}

if (require.main === module) {
  runFullCrawler()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

module.exports = { runFullCrawler };
