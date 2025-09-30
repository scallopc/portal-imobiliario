import { useQuery } from '@tanstack/react-query';
import { getPropertyById } from '@/actions/get-property-by-id';
import { PropertyInput } from '@/schemas/property';

export const getPropertyQueryKey = (id: string) => ['property', id] as const;

async function fetchProperty(id: string): Promise<PropertyInput> {
  if (!id) {
    throw new Error('ID do imóvel não fornecido.');
  }

  const result = await getPropertyById({ id });

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.data) {
    throw new Error('Imóvel não encontrado.');
  }

  return result.data as PropertyInput;
}

export function useProperty(id: string) {
  return useQuery<PropertyInput, Error>({
    queryKey: getPropertyQueryKey(id),
    queryFn: () => fetchProperty(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      if (error.message.includes('não encontrado') || error.message.includes('inválido')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

