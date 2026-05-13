'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document_type: z.enum(['cpf', 'cnpj']).optional(),
  document: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address_zip: z.string().optional().nullable(),
  address_street: z.string().optional().nullable(),
  address_number: z.string().optional().nullable(),
  address_complement: z.string().optional().nullable(),
  address_neighborhood: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_state: z.string().optional().nullable(),
})

export type CustomerInput = z.infer<typeof customerSchema>


export async function saveCustomer(data: CustomerInput, id?: string) {
  try {
    const validation = customerSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: 'Dados do cliente inválidos' }
    }

    const validatedData = validation.data
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const customerData = {
      ...validatedData,
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
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID do cliente inválido' }
    }

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
