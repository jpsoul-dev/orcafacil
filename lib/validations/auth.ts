import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(6, 'A senha deve ter no mínimo 6 caracteres')
  .regex(/[a-z]/, 'Obrigatorio letra minúscula')
  .regex(/[A-Z]/, 'Obrigatorio letra maiúscula')
  .regex(/[0-9]/, 'Obrigatorio um número')

export const authSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: passwordSchema,
})

export type AuthSchema = z.infer<typeof authSchema>

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export type LoginSchema = z.infer<typeof loginSchema>
