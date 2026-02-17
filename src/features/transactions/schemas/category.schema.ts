import { z } from 'zod/v4'

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  type: z.enum(['income', 'expense']),
  icon: z.string().min(1, 'Icone e obrigatorio'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor invalida'),
})

export type CategoryFormData = z.infer<typeof categorySchema>
