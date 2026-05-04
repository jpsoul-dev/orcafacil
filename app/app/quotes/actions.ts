'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateRandomHash } from '@/lib/hashids'

export async function saveQuote(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { id, items, ...quoteData } = data
  
  const quotePayload = {
    ...quoteData,
    user_id: user.id,
  }

  let quoteId = id;
  let publicUuid = quoteData.public_uuid;

  if (id) {
    // Modo edição
    const { data: updatedQuote, error: quoteError } = await supabase
      .from('quotes')
      .update(quotePayload)
      .eq('id', id)
      .select('id, public_uuid')
      .single()

    if (quoteError || !updatedQuote) {
      return { error: quoteError?.message || 'Erro ao atualizar orçamento' }
    }
    quoteId = updatedQuote.id;
    publicUuid = updatedQuote.public_uuid;

    // Deletar itens antigos
    await supabase.from('quote_items').delete().eq('quote_id', id)
  } else {
    // Modo criação
    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        ...quotePayload,
        hash_id: generateRandomHash()
      })
      .select('id, public_uuid')
      .single()

    if (quoteError || !newQuote) {
      return { error: quoteError?.message || 'Erro ao criar orçamento' }
    }
    quoteId = newQuote.id;
    publicUuid = newQuote.public_uuid;
  }

  if (items && items.length > 0) {
    const insertItems = items.map((item: any) => ({
      quote_id: quoteId,
      catalog_item_id: item.catalog_item_id || null,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
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
  const supabase = await createClient()
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/quotes')
  return { success: true }
}

export async function updateQuoteStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/quotes')
  return { success: true }
}
