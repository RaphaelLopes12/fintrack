import { z } from 'zod/v4'

export const recurringExpenseSchema = z.object({
  description: z.string().min(1, 'Descricao e obrigatoria'),
  amount: z.number().positive('Valor deve ser maior que zero'),
  category_id: z.string().min(1, 'Categoria e obrigatoria'),
  credit_card_id: z.string().nullable(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  start_date: z.union([z.date(), z.string().min(1, 'Data e obrigatoria')]),
  end_date: z.union([z.date(), z.string()]).nullable(),
})

export type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>
