import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>
