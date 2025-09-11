import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    
    // Parâmetros de filtro opcionais
    const type = searchParams.get('type')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const city = searchParams.get('city')
    const neighborhood = searchParams.get('neighborhood')
    const query = searchParams.get('query')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    
    const base = adminDb.collection('properties')
    let firestoreQuery: FirebaseFirestore.Query = base
    
    // Aplicar filtros do Firestore (apenas os que são indexados)
    if (type) {
      firestoreQuery = firestoreQuery.where('type', '==', type)
    }
    
    if (minPrice) {
      firestoreQuery = firestoreQuery.where('price', '>=', parseFloat(minPrice))
    }
    
    if (maxPrice) {
      firestoreQuery = firestoreQuery.where('price', '<=', parseFloat(maxPrice))
    }
    
    if (city) {
      firestoreQuery = firestoreQuery.where('address.city', '==', city)
    }
    
    if (neighborhood) {
      firestoreQuery = firestoreQuery.where('address.neighborhood', '==', neighborhood)
    }
    
    // Ordenar por data de criação (mais recentes primeiro)
    firestoreQuery = firestoreQuery.orderBy('createdAt', 'desc')
    
    // Buscar TODOS os dados (sem paginação do Firebase)
    const snapshot = await firestoreQuery.get()
    
    let properties = snapshot.docs.map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    })
    
    // Aplicar filtros no frontend (que não são indexados no Firestore)
    if (query) {
      const searchTerm = query.toLowerCase()
      properties = properties.filter(property => 
        property.title?.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm) ||
        property.address?.street?.toLowerCase().includes(searchTerm) ||
        property.address?.neighborhood?.toLowerCase().includes(searchTerm) ||
        property.address?.city?.toLowerCase().includes(searchTerm)
      )
    }
    
    if (bedrooms) {
      const bedroomsNum = parseInt(bedrooms)
      properties = properties.filter(property => 
        property.bedrooms >= bedroomsNum
      )
    }
    
    if (bathrooms) {
      const bathroomsNum = parseInt(bathrooms)
      properties = properties.filter(property => 
        property.bathrooms >= bathroomsNum
      )
    }
    
    if (minArea) {
      const minAreaNum = parseFloat(minArea)
      properties = properties.filter(property => 
        property.area >= minAreaNum
      )
    }
    
    if (maxArea) {
      const maxAreaNum = parseFloat(maxArea)
      properties = properties.filter(property => 
        property.area <= maxAreaNum
      )
    }
    
    // Retornar todos os dados filtrados (paginação será feita no frontend)
    return NextResponse.json({
      properties,
      total: properties.length
    })
    
  } catch (error) {
    console.error('Erro ao buscar propriedades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
