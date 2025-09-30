'use server'

import app from '@/lib/firebase'
import { getFirestore, collection, query, getDocs } from 'firebase/firestore'
import { getReleasesSchema, getReleaseByIdSchema, type GetReleasesInput, type GetReleaseByIdInput } from './schema'
import { Release } from '@/types/releases'

export async function getReleases(input: GetReleasesInput) {
  try {
    const validatedInput = getReleasesSchema.parse(input)
        
    const db = getFirestore(app)
    const releasesRef = collection(db, 'releases')
    const q = query(releasesRef)
    const snapshot = await getDocs(q)

    
    let releases = snapshot.docs.map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      }
    })

    // Ordenar por data de criação (mais recentes primeiro)
    releases = releases.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })
    
    // Aplicar paginação
    const startIndex = validatedInput.offset
    const endIndex = startIndex + validatedInput.limit
    const paginatedReleases = releases.slice(startIndex, endIndex)
    
    
    return {
      success: true,
      data: paginatedReleases,
      total: releases.length
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar releases',
      data: [],
      total: 0
    }
  }
}

export async function getReleaseById(input: GetReleaseByIdInput) {
  try {
    const validatedInput = getReleaseByIdSchema.parse(input)
    
    console.log(`🚀 Buscando release ${validatedInput.id} diretamente do Firebase...`)
    
    const db = getFirestore(app)
    const releasesRef = collection(db, 'releases')
    const q = query(releasesRef)
    const snapshot = await getDocs(q)
    
    const release = snapshot.docs.find(doc => doc.id === validatedInput.id)
    
    if (!release) {
      return {
        success: false,
        error: 'Release não encontrado',
        data: null
      }
    }
    
    const data = release.data() as any
    const releaseData = {
      id: release.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    }
    
    // Transformar release em formato de ReleaseDetails
    const releaseDetails: Release = {
        id: releaseData.id,
        title: releaseData.title,
        description: releaseData.description,
        images: releaseData.images || [],
        floorPlans: releaseData.floorPlans || [],
        isActive: releaseData.isActive !== false,
        unitsCount: releaseData.unitsCount || 1,
        createdAt: releaseData.createdAt?.getTime?.() || releaseData.createdAt,
        minUnitPrice: releaseData.minUnitPrice,
        address: {
          city: releaseData.address?.city || '',
          street: releaseData.address?.street || '',
          neighborhood: releaseData.address?.neighborhood || ''
        },
        developer: releaseData.developer || '',
        units: releaseData.units || []
    }

    return {
      success: true,
      data: releaseDetails
    }
  } catch (error) {
    console.error('Erro ao buscar release por ID:', error)
    return {
      success: false,
      error: 'Erro ao buscar release',
      data: null
    }
  }
}
