'use server';

import 'server-only';
import { adminDb } from '@/lib/firebase-admin';
import { propertySchema } from '@/schemas/property';
import { GetPropertyByIdSchema, GetPropertyByIdInput } from './schema';

export async function getPropertyById(input: GetPropertyByIdInput): Promise<{ data?: any; error?: string }> {
  try {
    const validatedInput = GetPropertyByIdSchema.safeParse(input);
    if (!validatedInput.success) {
      return { error: 'ID do imóvel inválido.' };
    }

    const { id } = validatedInput.data;

    const propertyDoc = await adminDb.collection('properties').doc(id).get();

    if (!propertyDoc.exists) {
      return { error: 'Imóvel não encontrado.' };
    }

    const propertyData = propertyDoc.data();

    const validatedProperty = propertySchema.safeParse({
      ...propertyData,
      id: propertyDoc.id,
    });

    if (!validatedProperty.success) {
      console.error('Erro de validação Zod:', validatedProperty.error.flatten());
      return { error: 'Dados do imóvel inconsistentes.' };
    }

    return { data: validatedProperty.data };
  } catch (error) {
    console.error('Erro ao buscar imóvel:', error);
    return { error: 'Ocorreu um erro ao buscar os detalhes do imóvel. Tente novamente mais tarde.' };
  }
}
