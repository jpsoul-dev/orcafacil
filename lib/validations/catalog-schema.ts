import { z } from 'zod'

// Helper to strip HTML tags from input fields to prevent XSS/unwanted markup
const sanitizeHtml = (val: string) => {
  return val.replace(/<[^>]*>/g, '').trim()
}

export const catalogItemSchema = z.object({
  type: z.enum(['product', 'service'], {
    message: 'O tipo do item é obrigatório.',
  }),
  name: z.string()
    .min(2, 'O nome deve conter pelo menos 2 caracteres.')
    .max(100, 'O nome deve conter no máximo 100 caracteres.')
    .transform(sanitizeHtml),
  unit_price: z.coerce.number()
    .min(0.01, 'O valor unitário deve ser estritamente maior que zero.'),
  unit_measure: z.string()
    .min(1, 'A unidade de medida é obrigatória.')
    .max(10, 'A unidade de medida deve conter no máximo 10 caracteres.')
    .transform(sanitizeHtml),
  description: z.string()
    .max(300, 'A descrição deve conter no máximo 300 caracteres.')
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => val ? sanitizeHtml(val) : val),
})

export type CatalogItemInput = z.infer<typeof catalogItemSchema>
