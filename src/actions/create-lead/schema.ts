import { z } from "zod"

export const createLeadSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").optional(),
  message: z.string().optional(),
  source: z.string().default("chat"),
  status: z.enum(["novo", "contatado", "qualificado", "convertido", "perdido"]).default("novo"),
  // Informações de geolocalização
  location: z.object({
    ip: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string().default("Brasil"),
    latitude: z.number(),
    longitude: z.number(),
    neighborhood: z.string().optional(),
    zipCode: z.string().optional()
  }),
  // Interesses e comportamento
  interests: z.array(z.string()).default([]),
  propertyTypes: z.array(z.string()).default([]),
  priceRange: z.object({
    min: z.number().optional(),
    max: z.number().optional()
  }).optional(),
  // Histórico de interações
  interactions: z.array(z.object({
    timestamp: z.date(),
    message: z.string(),
    response: z.string()
  })).default([]),
  // Metadados
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional()
}).refine((data) => !!(data.name || data.email || data.phone), {
  message: "Informe ao menos nome, email ou telefone",
  path: ["_root"],
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>


