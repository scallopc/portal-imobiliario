import { z } from "zod"

export const getLinkParamsSchema = z.object({
  id: z.string(),
})

export const linkSchema = z.object({
  id: z.string(),
  type: z.enum(["Linktree", "Google Drive", "Site", "Outro"]),
  title: z.string(),
  url: z.string().url(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type LinkDTO = z.infer<typeof linkSchema>


