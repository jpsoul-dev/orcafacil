'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCatalogItem(data: any, id?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const itemData = {
    ...data,
    user_id: user.id,
  }

  let error;
  if (id) {
    const { error: updateError } = await supabase
      .from('catalog_items')
      .update(itemData)
      .eq('id', id)
      .eq('user_id', user.id)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('catalog_items')
      .insert(itemData)
    error = insertError
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/catalog')
  return { success: true }
}

export async function deleteCatalogItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('catalog_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/catalog')
  return { success: true }
}
