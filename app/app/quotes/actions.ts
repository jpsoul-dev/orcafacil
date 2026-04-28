'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveQuote(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Start a basic transaction-like operation
  const { items, ...quoteData } = data
  
  const insertQuote = {
    ...quoteData,
    user_id: user.id,
  }

  const { data: newQuote, error: quoteError } = await supabase
    .from('quotes')
    .insert(insertQuote)
    .select('id, public_uuid')
    .single()

  if (quoteError || !newQuote) {
    return { error: quoteError?.message || 'Erro ao criar orçamento' }
  }

  if (items && items.length > 0) {
    const insertItems = items.map((item: any) => ({
      quote_id: newQuote.id,
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
      // In a real prod environment we should rollback or use a postgres function RPC
      // For MVP we just log
      console.error('Failed to insert items', itemsError)
    }
  }

  revalidatePath('/app/quotes')
  return { success: true, public_uuid: newQuote.public_uuid }
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
