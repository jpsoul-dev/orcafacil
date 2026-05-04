'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateQuoteStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/app/quotes/${id}`)
  revalidatePath('/app/quotes')
  return { success: true }
}

export async function updatePublicQuoteStatus(uuid: string, status: string) {
  const supabase = await createClient()

  // Validar se o status é permitido para o cliente
  if (!['accepted', 'rejected'].includes(status)) {
    return { error: 'Ação não permitida' }
  }

  const { error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('public_uuid', uuid)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/quote/${uuid}`)
  return { success: true }
}
