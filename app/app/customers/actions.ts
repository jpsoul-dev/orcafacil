'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CustomerService, CustomerInput, customerSchema } from '@/lib/services/customer-service'
import type { CustomerServiceResult, CustomerQuote, CustomerReceipt } from '@/lib/services/customer-service'

export async function saveCustomer(data: CustomerInput, id?: string) {
  try {
    const validation = customerSchema.safeParse(data)
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Dados inválidos'
      return { success: false, error: firstError }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const result = await CustomerService.saveCustomer(validation.data, user.id, id)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath('/app/customers')
    
    return { success: true, data: result.data }
  } catch (error) {
    console.error('Error in saveCustomer Action:', error)
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

    const result = await CustomerService.deleteCustomer(id, user.id)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath('/app/customers')
    
    return { success: true }
  } catch (error) {
    console.error('Error in deleteCustomer Action:', error)
    return {
      success: false,
      error: 'Ocorreu um erro inesperado ao excluir o cliente.',
    }
  }
}

export async function checkCustomerRelations(customerId: string): Promise<CustomerServiceResult<boolean>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false as const, error: 'Usuário não autenticado' }
    }

    return await CustomerService.hasActiveBudgets(customerId, user.id)
  } catch (error) {
    console.error('Error in checkCustomerRelations:', error)
    return { success: false as const, error: 'Erro ao verificar dependências do cliente.' }
  }
}

export async function getCustomerQuotesAction(customerId: string): Promise<CustomerServiceResult<CustomerQuote[]>> {
  try {
    if (!customerId || typeof customerId !== 'string') {
      return { success: false, error: 'ID do cliente inválido' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    return await CustomerService.getCustomerQuotes(customerId, user.id)
  } catch (error) {
    console.error('Error in getCustomerQuotesAction:', error)
    return {
      success: false as const,
      error: 'Ocorreu um erro inesperado ao carregar os orçamentos.',
    }
  }
}

export async function getCustomerReceiptsAction(customerId: string): Promise<CustomerServiceResult<CustomerReceipt[]>> {
  try {
    if (!customerId || typeof customerId !== 'string') {
      return { success: false, error: 'ID do cliente inválido' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    return await CustomerService.getCustomerReceipts(customerId, user.id)
  } catch (error) {
    console.error('Error in getCustomerReceiptsAction:', error)
    return {
      success: false as const,
      error: 'Ocorreu um erro inesperado ao carregar os recibos.',
    }
  }
}

