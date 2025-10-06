'use server';

import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { GetPropertyByIdSchema, GetPropertyByIdInput } from './schema';

// Função para serializar dados do Firestore para JSON
function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate();
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }
  
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeFirestoreData(value);
    }
    return serialized;
  }
  
  return data;
}

export async function getPropertyBySlug(input: GetPropertyByIdInput): Promise<{ data?: any; error?: string }> {
  try {
    const validatedInput = GetPropertyByIdSchema.safeParse(input);
    if (!validatedInput.success) {
      return { error: 'Slug do imóvel inválido.' };
    }

    const { id: slug } = validatedInput.data;

    // Buscar por slug ao invés de ID do documento
    const querySnapshot = await adminDb.collection('properties').where('slug', '==', slug).limit(1).get();

    if (querySnapshot.empty) {
      return { error: 'Imóvel não encontrado.' };
    }

    const propertyDoc = querySnapshot.docs[0];

    const propertyData = propertyDoc.data();
    
    // Serializar todos os dados do Firestore para JSON
    const serializedData = serializeFirestoreData(propertyData);
    
    const data = {
      id: propertyDoc.id,
      ...serializedData,
    };

    return { data };
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
    return { error: 'Ocorreu um erro ao buscar os detalhes do imóvel. Tente novamente mais tarde.' };
  }
}
