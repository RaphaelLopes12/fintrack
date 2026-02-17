import { z } from 'zod/v4'

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
