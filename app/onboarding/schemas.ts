import { z } from 'zod'

export const onboardingSchema = z.object({
  name: z.string().min(3, 'O nome do negócio deve ter pelo menos 3 caracteres'),
  phone: z.string().min(14, 'Informe um WhatsApp válido'),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>
