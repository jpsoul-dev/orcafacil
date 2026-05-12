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
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const customerData = {
      ...data,
      user_id: user.id,
    }

    if (id) {
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return { success: false, error: error.message }
      }
    } else {
      const { error } = await supabase
        .from('customers')
        .insert(customerData)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath('/app/customers')
    if (id) revalidatePath(`/app/customers/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error in saveCustomer:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao salvar o cliente.',
    }
  }
}

export async function deleteCustomer(id: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/app/customers')
    revalidatePath(`/app/customers/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Error in deleteCustomer:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao excluir o cliente.',
    }
  }
}
