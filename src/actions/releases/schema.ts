import { z } from 'zod'

export const getReleasesSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  isActive: z.boolean().optional(),
})

export const getReleaseByIdSchema = z.object({
  id: z.string().min(1),
})

export type GetReleasesInput = z.infer<typeof getReleasesSchema>
export type GetReleaseByIdInput = z.infer<typeof getReleaseByIdSchema>
