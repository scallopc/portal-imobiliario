import { z } from "zod"

export const propertySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  type: z.enum(["casa", "apartamento", "terreno", "comercial"]),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  area: z.number(),
  address: z.object({
    street: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  images: z.array(z.string().url()).default([]),
  features: z.array(z.string()).default([]),
  contact: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
  }),
  createdAt: z.union([z.date(), z.string(), z.any()]).transform((v) => {
    if (v instanceof Date) return v
    const d = new Date(v)
    return isNaN(d.getTime()) ? new Date() : d
  }),
  updatedAt: z.union([z.date(), z.string(), z.any()]).transform((v) => {
    if (v instanceof Date) return v
    const d = new Date(v)
    return isNaN(d.getTime()) ? new Date() : d
  }),
})

export type PropertyDTO = z.infer<typeof propertySchema>
