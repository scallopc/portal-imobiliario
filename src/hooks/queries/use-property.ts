import { useQuery } from "@tanstack/react-query";
import { getPropertyBySlug } from "@/actions/get-property-by-slug";
import { PropertyBaseSchema } from "@/schemas/property";

export const getPropertyQueryKey = (slug: string) => ["property", slug] as const;

async function fetchProperty(slug: string): Promise<PropertyBaseSchema> {
  if (!slug) {
    throw new Error("Slug do imóvel não fornecido.");
  }

  const result = await getPropertyBySlug({ id: slug });

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.data) {
    throw new Error("Imóvel não encontrado.");
  }

  return result.data as PropertyBaseSchema;
}

export function useProperty(slug: string) {
  return useQuery<PropertyBaseSchema, Error>({
    queryKey: getPropertyQueryKey(slug),
    queryFn: () => fetchProperty(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      if (error.message.includes("não encontrado") || error.message.includes("inválido")) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
