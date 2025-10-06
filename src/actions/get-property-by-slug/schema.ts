import { z } from 'zod';

export const GetPropertyByIdSchema = z.object({
  id: z.string().min(1, 'O ID do imóvel é obrigatório.'),
});

export type GetPropertyByIdInput = z.infer<typeof GetPropertyByIdSchema>;
