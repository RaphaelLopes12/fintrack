import { z } from 'zod/v4'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  credit_card_id: z.string().nullable(),
  date: z.union([z.date(), z.string().min(1, 'Data é obrigatória')]),
  is_recurring: z.boolean(),
  recurring_frequency: z.enum(['weekly', 'monthly', 'yearly']).nullable(),
  notes: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
