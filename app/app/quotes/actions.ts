'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateRandomHash } from '@/lib/hashids'
import { z } from 'zod'

const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.number(),
  unit_measure: z.string().optional().nullable(),
})

const quoteSchema = z.object({
  id: z.string().optional(),
  public_uuid: z.string().optional(),
  customer_id: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  status: z.enum(['draft', 'open', 'accepted', 'rejected', 'expired', 'vencido']).optional(),
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


export async function saveQuote(data: QuoteInput) {
  try {
    const validation = quoteSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: 'Dados do orçamento inválidos' }
    }

    const validatedData = validation.data
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { id, items, ...quoteData } = validatedData

    // Chamada atômica via RPC para garantir transacionalidade
    const { data: result, error: rpcError } = await supabase.rpc('upsert_quote_with_items', {
      p_quote_id: id || null,
      p_customer_id: quoteData.customer_id || null,
      p_title: quoteData.title || null,
      p_status: quoteData.status || null,
      p_subtotal: quoteData.subtotal,
      p_total: quoteData.total,
      p_valid_until: quoteData.valid_until || null,
      p_discount_type: quoteData.discount_type || 'none',
      p_discount_value: quoteData.discount_value || 0,
      p_notes: quoteData.notes || null,
      p_items: items,
      p_user_id: user.id,
      p_hash_id: id ? null : generateRandomHash()
    })

    if (rpcError || !result) {
      console.error('Erro na RPC upsert_quote_with_items:', rpcError)
      return {
        success: false,
        error: rpcError?.message || 'Erro ao processar orçamento no banco de dados',
      }
    }

    revalidatePath('/app/quotes')
    return { success: true, public_uuid: result.public_uuid, id: result.id }
  } catch (error) {
    console.error('Error in saveQuote:', error)
    return { 
      success: false, 
      error: 'Ocorreu um erro inesperado ao salvar o orçamento.' 
    }
  }
}


export async function deleteQuote(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID do orçamento inválido' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/app/quotes')
    return { success: true }
  } catch (error) {
    console.error('Error deleting quote:', error)
    return { success: false, error: 'Erro interno ao deletar orçamento' }
  }
}


