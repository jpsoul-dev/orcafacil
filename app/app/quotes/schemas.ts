import { z } from 'zod'

export const statusSchema = z.enum(['draft', 'open', 'accepted', 'rejected', 'expired', 'vencido'])

export const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.number(),
  unit_measure: z.string().optional().nullable(),
})

export const quoteSchema = z.object({
  id: z.string().optional(),
  public_uuid: z.string().optional(),
  customer_id: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: statusSchema.optional(),
  subtotal: z.number(),
  total: z.number(),
  valid_until: z.string().optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed', 'none']).optional(),
  discount_value: z.number().optional(),
  tax_value: z.number().optional(),
  shipping_value: z.number().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(quoteItemSchema),
})

export type QuoteInput = z.infer<typeof quoteSchema>
export type QuoteItemInput = z.infer<typeof quoteItemSchema>
export type QuoteStatus = z.infer<typeof statusSchema>
