import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug do release é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar por slug ao invés de ID do documento
    const querySnapshot = await adminDb.collection('releases').where('slug', '==', slug).limit(1).get()

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Release não encontrado' },
        { status: 404 }
      )
    }

    const releaseDoc = querySnapshot.docs[0]
    const data = releaseDoc.data() as any
    
    const release = {
      id: releaseDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    }

    return NextResponse.json(release)

  } catch (error) {
    console.error('Erro ao buscar release:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
