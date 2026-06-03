import { z } from 'zod'

export const statusSchema = z.enum([
  'draft',
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'completed',
  'expired'
])

export const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.coerce.number(),
  unit_measure: z.string().optional().nullable(),
})

export const quoteSchema = z.object({
  id: z.string().optional(),
  public_uuid: z.string().optional(),
  customer_id: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: statusSchema.optional(),
  subtotal: z.coerce.number(),
  total: z.coerce.number(),
  valid_until: z.string().optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed', 'none']).optional(),
  discount_value: z.coerce.number().optional(),
  tax_value: z.coerce.number().optional(),
  shipping_value: z.coerce.number().optional(),
  notes: z.string().optional().nullable(),
  cancellation_reason: z.string().optional().nullable(),
  items: z.array(quoteItemSchema),
})

export const cancelQuoteSchema = z.object({
  quoteId: z.string().uuid('ID do orçamento inválido'),
  cancellationReason: z.string().min(5, 'O motivo do cancelamento deve possuir no mínimo 5 caracteres')
})

export const receiptSchema = z.object({
  id: z.string().uuid().optional(),
  quoteId: z.string().uuid('ID do orçamento inválido'),
  title: z.string().min(1, 'O título do recibo é obrigatório'),
  amount: z.coerce.number().min(0.01, 'O valor do recibo deve ser maior que zero'),
  paymentMethod: z.string().min(1, 'A forma de pagamento é obrigatória'),
  servicesDescription: z.string().min(1, 'A descrição dos serviços é obrigatória'),
  issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de emissão inválida (formato AAAA-MM-DD)')
})

export type QuoteInput = z.infer<typeof quoteSchema>
export type QuoteItemInput = z.infer<typeof quoteItemSchema>
export type QuoteStatus = z.infer<typeof statusSchema>
export type ReceiptInput = z.infer<typeof receiptSchema>

