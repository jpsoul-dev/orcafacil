'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateRandomHash } from '@/lib/hashids'

export interface QuoteItemInput {
  catalog_item_id?: string | null
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string | null
}

export interface QuoteInput {
  id?: string
  public_uuid?: string
  customer_id?: string | null
  title?: string | null
  status?: 'draft' | 'open' | 'accepted' | 'rejected' | 'expired' | 'vencido'
  subtotal: number
  total: number
  valid_until?: string | null
  discount_type?: 'percentage' | 'fixed' | 'none'
  discount_value?: number
  tax_value?: number
  shipping_value?: number
  notes?: string | null
  items: QuoteItemInput[]
}

export async function saveQuote(data: QuoteInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { id, items, ...quoteData } = data

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
      return { error: quoteError?.message || 'Erro ao atualizar orçamento' }
    }
    quoteId = updatedQuote.id
    publicUuid = updatedQuote.public_uuid

    // Deletar itens antigos
    await supabase.from('quote_items').delete().eq('quote_id', id)
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
      return { error: quoteError?.message || 'Erro ao criar orçamento' }
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
    }
  }

  revalidatePath('/app/quotes')
  return { success: true, public_uuid: publicUuid, id: quoteId }
}

export async function deleteQuote(id: string) {
  try {
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

export async function updateQuoteStatus(id: string, status: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/app/quotes')
    return { success: true }
  } catch (error) {
    console.error('Error updating quote status:', error)
    return { success: false, error: 'Erro interno ao atualizar status do orçamento' }
  }
}
