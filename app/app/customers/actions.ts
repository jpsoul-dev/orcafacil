'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCustomer(data: any, id?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const customerData = {
    ...data,
    user_id: user.id,
  }

  let error;
  if (id) {
    const { error: updateError } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .eq('user_id', user.id)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('customers')
      .insert(customerData)
    error = insertError
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/customers')
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/customers')
  return { success: true }
}
