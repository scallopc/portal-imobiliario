import { z } from "zod"

export const createLeadSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  stage: z.enum(["new", "contacted", "qualified", "won", "lost"]).default("new"),
  source: z.enum(["website", "social", "referral", "other"]).default("website"),
  notes: z.string().optional().or(z.literal("")),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
