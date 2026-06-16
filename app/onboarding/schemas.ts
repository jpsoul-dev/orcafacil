import { z } from 'zod'

export const onboardingSchema = z.object({
  name: z.string().min(3, 'O nome do negócio deve ter pelo menos 3 caracteres'),
  industry: z.string().min(1, 'Selecione o seguimento de mercado do seu negócio'),
})

export type OnboardingValues = z.infer<typeof onboardingSchema>

