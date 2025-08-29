import { z } from "zod"

export const createPropertySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z.number().nonnegative(),
  type: z.enum(["casa", "apartamento", "terreno", "comercial"]),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: z.number().positive(),
  address: z.object({
    street: z.string().min(1),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  images: z.array(z.string().url()).default([]),
  features: z.array(z.string()).default([]),
  contact: z.object({
    name: z.string().min(1),
    phone: z.string().min(8),
    email: z.string().email(),
  }),
  listedBy: z.string().optional(),
})

export type CreatePropertyInput = z.infer<typeof createPropertySchema>
