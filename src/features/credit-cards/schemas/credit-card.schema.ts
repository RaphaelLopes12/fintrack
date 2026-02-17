import { z } from 'zod/v4'

export const creditCardSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  last_four_digits: z
    .string()
    .regex(/^\d{4}$/, 'Informe exatamente 4 dígitos'),
  brand: z.enum([
    'visa',
    'mastercard',
    'elo',
    'amex',
    'hipercard',
    'other',
  ]),
  card_limit: z.number().min(0, 'Limite deve ser maior ou igual a zero'),
  billing_day: z
    .number()
    .int()
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31'),
  due_day: z
    .number()
    .int()
    .min(1, 'Dia deve ser entre 1 e 31')
    .max(31, 'Dia deve ser entre 1 e 31'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
})

export type CreditCardFormData = z.infer<typeof creditCardSchema>
