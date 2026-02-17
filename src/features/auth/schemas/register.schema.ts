import { z } from 'zod/v4'

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.email('Email invalido'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula')
      .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minuscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um numero'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao coincidem',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
