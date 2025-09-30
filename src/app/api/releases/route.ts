import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
        
    const base = adminDb.collection('releases')
    let firestoreQuery: FirebaseFirestore.Query = base
    
    // ordenar por data de criação (mais recentes primeiro)
    firestoreQuery = firestoreQuery.orderBy('createdAt', 'desc')
    const snapshot = await firestoreQuery.get()
    
    let releases = snapshot.docs.map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    })

    const response = {
      releases,
      total: releases.length
    }
        
    return NextResponse.json(response)
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
