import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de filtro opcionais
    const type = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    
    let query = adminDb.collection('properties')
    
    // Aplicar filtros
    if (type) {
      query = query.where('type', '==', type)
    }
    
    if (minPrice) {
      query = query.where('price', '>=', parseFloat(minPrice))
    }
    
    if (maxPrice) {
      query = query.where('price', '<=', parseFloat(maxPrice))
    }
    
    if (city) {
      query = query.where('address.city', '==', city)
    }
    
    if (neighborhood) {
      query = query.where('address.neighborhood', '==', neighborhood)
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    query = query.orderBy('createdAt', 'desc')
    
    // Paginação - Firestore não tem offset, vamos usar startAfter para paginação
    // Por simplicidade, vamos limitar a 20 itens por página
    query = query.limit(limit)
    
    const snapshot = await query.get()
    
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }))
    
    return NextResponse.json({
      properties,
      pagination: {
        page,
        limit,
        total: properties.length, // Por enquanto, apenas o total da página atual
        totalPages: 1, // Simplificado por enquanto
        hasNext: properties.length === limit,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
