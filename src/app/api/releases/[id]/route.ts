import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'ID do release é obrigatório' },
        { status: 400 }
      )
    }

    const releaseDoc = await adminDb.collection('releases').doc(id).get()

    if (!releaseDoc.exists) {
      return NextResponse.json(
        { error: 'Release não encontrado' },
        { status: 404 }
      )
    }

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
