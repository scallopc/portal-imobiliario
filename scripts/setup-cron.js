const cron = require('node-cron')
const axios = require('axios')

// Configuração do cron job para executar a cada 6 horas
const CRAWLER_SCHEDULE = '0 */6 * * *' // A cada 6 horas
const CRAWLER_URL = process.env.CRAWLER_URL || 'http://localhost:3000/api/crawler'

console.log('Configurando cron job para o crawler...')
console.log(`URL do crawler: ${CRAWLER_URL}`)
console.log(`Agendamento: ${CRAWLER_SCHEDULE}`)

// Função para executar o crawler
async function runCrawler() {
  try {
    console.log(`[${new Date().toISOString()}] Executando crawler...`)
    
    const response = await axios.post(CRAWLER_URL, {}, {
      headers: {
        'Content-Type': 'application/json',
        // Adicione aqui headers de autenticação se necessário
        // 'Authorization': `Bearer ${process.env.CRAWLER_TOKEN}`
      },
      timeout: 300000 // 5 minutos de timeout
    })
    
    console.log(`[${new Date().toISOString()}] Crawler executado com sucesso:`, response.data)
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Erro ao executar crawler:`, error.message)
    console.error('Erro completo:', error)
    
    if (error.response) {
      console.error('Status da resposta:', error.response.status)
      console.error('Dados da resposta:', error.response.data)
    } else if (error.request) {
      console.error('Erro de conexão - servidor não respondeu')
      console.error('Detalhes da requisição:', error.request)
    } else {
      console.error('Erro de configuração:', error.message)
    }
  }
}

// Configurar o cron job
const crawlerTask = cron.schedule(CRAWLER_SCHEDULE, runCrawler, {
  scheduled: false, // Não iniciar automaticamente
  timezone: 'America/Sao_Paulo' // Fuso horário do Brasil
})

// Função para iniciar o cron job
function startCrawler() {
  console.log('Iniciando cron job do crawler...')
  crawlerTask.start()
  
  // Executar uma vez imediatamente se solicitado
  if (process.argv.includes('--run-now')) {
    console.log('Executando crawler imediatamente...')
    runCrawler()
  }
}

// Função para parar o cron job
function stopCrawler() {
  console.log('Parando cron job do crawler...')
  crawlerTask.stop()
}

// Tratamento de sinais para parar graciosamente
process.on('SIGINT', () => {
  console.log('Recebido SIGINT, parando crawler...')
  stopCrawler()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, parando crawler...')
  stopCrawler()
  process.exit(0)
})

// Exportar funções para uso externo
module.exports = {
  startCrawler,
  stopCrawler,
  runCrawler
}

// Se executado diretamente, iniciar o crawler
if (require.main === module) {
  startCrawler()
}
