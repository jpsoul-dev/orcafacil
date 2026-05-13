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

    const quotePayload = {
      ...quoteData,
      user_id: user.id,
    }

    let quoteId = id
    let publicUuid = quoteData.public_uuid

    if (id) {
      // Modo edição
      const { data: updatedQuote, error: quoteError } = await supabase
        .from('quotes')
        .update(quotePayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, public_uuid')
        .single()

      if (quoteError || !updatedQuote) {
        return {
          success: false,
          error: quoteError?.message || 'Erro ao atualizar orçamento',
        }
      }
      quoteId = updatedQuote.id
      publicUuid = updatedQuote.public_uuid

      // Deletar itens antigos antes de inserir os novos
      const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id)

      if (deleteError) {
        return {
          success: false,
          error: 'Erro ao atualizar itens do orçamento',
        }
      }
    } else {
      // Modo criação
      const { data: newQuote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
          ...quotePayload,
          hash_id: generateRandomHash(),
        })
        .select('id, public_uuid')
        .single()

      if (quoteError || !newQuote) {
        return {
          success: false,
          error: quoteError?.message || 'Erro ao criar orçamento',
        }
      }
      quoteId = newQuote.id
      publicUuid = newQuote.public_uuid
    }

    if (items && items.length > 0) {
      const insertItems = items.map((item: QuoteItemInput) => ({
        ...item,
        quote_id: quoteId,
      }))

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(insertItems)

      if (itemsError) {
        console.error('Failed to insert items', itemsError)
        
        // ROLLBACK: Se falhar ao inserir itens em um novo orçamento, removemos o orçamento "vazio"
        if (!id) {
          await supabase.from('quotes').delete().eq('id', quoteId)
        }
        
        return { 
          success: false, 
          error: 'Falha ao salvar os itens do orçamento. O orçamento não foi salvo corretamente.' 
        }
      }
    }

    revalidatePath('/app/quotes')
    return { success: true, public_uuid: publicUuid, id: quoteId }
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


