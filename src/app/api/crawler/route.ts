import { NextRequest, NextResponse } from 'next/server'
import { HybridCrawler } from '@/lib/hybrid-crawler'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API Crawler Híbrido iniciada...')
    
    // Verificar se é uma requisição autorizada (você pode adicionar autenticação aqui)
    const authHeader = request.headers.get('authorization')
    
    // Para desenvolvimento, aceitar qualquer requisição
    // Em produção, implementar autenticação adequada
    if (process.env.NODE_ENV === 'production' && !authHeader) {
      console.log('❌ Não autorizado em produção')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Autenticação aprovada')
    console.log('🔄 Iniciando execução do crawler híbrido...')
    
    const crawler = new HybridCrawler()
    await crawler.runCrawler()
    
    console.log('✅ Crawler híbrido executado com sucesso')
    
    return NextResponse.json({
      success: true,
      message: 'Crawler híbrido executado com sucesso',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao executar crawler híbrido:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Endpoint para verificar status do crawler
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action')
    
    if (action === 'status') {
      // Aqui você pode implementar verificação de status
      return NextResponse.json({
        status: 'ready',
        lastRun: new Date().toISOString(),
        message: 'Crawler híbrido está pronto para execução'
      })
    }
    
    return NextResponse.json({
      message: 'Crawler Híbrido API - Use POST para executar o crawler'
    })
    
  } catch (error) {
    console.error('Erro ao verificar status do crawler:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
