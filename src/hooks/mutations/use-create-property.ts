import { useMutation, mutationOptions } from "@tanstack/react-query"
import type { CreatePropertyInput } from "@/actions/create-property/schema"

export const createPropertyMutationKey = () => ["properties", "create"] as const

export type CreatePropertyClientInput = Omit<CreatePropertyInput, "listedBy">

async function postProperty(input: CreatePropertyClientInput): Promise<{ id: string }> {
  const res = await fetch("/api/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error("401 Unauthorized")
    const text = await res.text().catch(() => "")
    throw new Error(text || `Failed to create property (${res.status})`)
  }
  return res.json()
}

export function useCreateProperty() {
  return useMutation(
    mutationOptions<{ id: string }, Error, CreatePropertyClientInput>({
      mutationKey: createPropertyMutationKey(),
      mutationFn: postProperty,
    })
  )
}
