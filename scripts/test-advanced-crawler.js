const { AdvancedCrawler } = require('../src/lib/advanced-crawler.js')
require('dotenv').config()

async function testAdvancedCrawler() {
  console.log('🧪 Testando crawler avançado com Playwright e Cheerio...')
  
  const crawler = new AdvancedCrawler()
  
  try {
    // URLs de teste - sites que provavelmente têm JavaScript
    const testUrls = [
      'https://www.tegraconecta.com.br/',
      'https://www.tegraconecta.com.br/tabelas',
      'https://www.tegraconecta.com.br/oportunidades',
      'https://www.tegraconecta.com.br/apresentacao'
    ]
    
    console.log(`📡 Testando ${testUrls.length} URLs...`)
    
    for (const url of testUrls) {
      console.log(`\n--- Testando: ${url} ---`)
      
      const property = await crawler.crawlUrl(url)
      
      if (property) {
        console.log(`✅ Sucesso!`)
        console.log(`   Título: ${property.title}`)
        console.log(`   Descrição: ${property.description.substring(0, 100)}...`)
        console.log(`   Preço: ${property.price || 'N/A'}`)
        console.log(`   Área: ${property.area || 'N/A'} m²`)
        console.log(`   Quartos: ${property.bedrooms || 'N/A'}`)
        console.log(`   Banheiros: ${property.bathrooms || 'N/A'}`)
        console.log(`   Vagas: ${property.parking || 'N/A'}`)
        console.log(`   Tipo: ${property.type}`)
        console.log(`   Status: ${property.status}`)
        console.log(`   Características: ${property.features.join(', ') || 'Nenhuma'}`)
        console.log(`   Imagens: ${property.images.length}`)
        console.log(`   Financiamento: ${property.financing || 'N/A'}`)
        console.log(`   Condições: ${property.conditions || 'N/A'}`)
        
        // Salvar no banco
        const propertyId = await crawler.saveProperty(property)
        console.log(`   💾 Salvo com ID: ${propertyId}`)
      } else {
        console.log(`❌ Falha ao extrair dados`)
      }
      
      // Aguardar entre requisições
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await crawler.close()
    console.log('\n✅ Teste concluído!')
  }
}

testAdvancedCrawler()
