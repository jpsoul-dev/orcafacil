'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CustomerInput {
  name: string
  document_type?: 'cpf' | 'cnpj'
  document?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  address_zip?: string | null
  address_street?: string | null
  address_number?: string | null
  address_complement?: string | null
  address_neighborhood?: string | null
  address_city?: string | null
  address_state?: string | null
}

export async function saveCustomer(data: CustomerInput, id?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const customerData = {
    ...data,
    user_id: user.id,
  }

  let error
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
  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/customers')
  return { success: true }
}
