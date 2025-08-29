import { z } from "zod"

const locationSchema = z.object({
  ip: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  neighborhood: z.string().optional(),
  zipCode: z.string().optional(),
})

const interactionSchema = z.object({
  timestamp: z.union([z.date(), z.string(), z.number()]).transform((v) => new Date(v)),
  message: z.string(),
  response: z.string(),
})

export const leadSchema = z.object({
  id: z.string().optional(),
  code: z.string().optional(), // ex.: L-18200
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.string().default("chat"),
  status: z.enum(["novo", "contatado", "qualificado", "convertido", "perdido"]).default("novo"),
  location: locationSchema,
  interests: z.array(z.string()).default([]),
  propertyTypes: z.array(z.string()).default([]),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  interactions: z.array(interactionSchema).default([]),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  leadScore: z.number().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.union([z.date(), z.any()]).optional(),
  updatedAt: z.union([z.date(), z.any()]).optional(),
  lastInteraction: z.union([z.date(), z.any()]).optional(),
})

export type LeadDTO = z.infer<typeof leadSchema>
