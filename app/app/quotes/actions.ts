'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateRandomHash } from '@/lib/hashids'

import { 
  statusSchema, 
  quoteSchema, 
  type QuoteInput 
} from './schemas'


export async function saveQuote(data: QuoteInput) {
  try {
    const validation = quoteSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: 'Dados do orçamento inválidos' }
    }

    const validatedData = validation.data
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { id, items, ...quoteData } = validatedData

    // Chamada atômica via RPC para garantir transacionalidade
    const { data: result, error: rpcError } = await supabase.rpc('upsert_quote_with_items', {
      p_quote_id: id || null,
      p_customer_id: quoteData.customer_id || null,
      p_title: quoteData.title || null,
      p_status: quoteData.status || null,
      p_subtotal: quoteData.subtotal,
      p_total: quoteData.total,
      p_valid_until: quoteData.valid_until || null,
      p_discount_type: quoteData.discount_type || 'none',
      p_discount_value: quoteData.discount_value || 0,
      p_notes: quoteData.notes || null,
      p_items: items,
      p_user_id: user.id,
      p_hash_id: id ? null : generateRandomHash()
    })

    if (rpcError || !result) {
      console.error('Erro na RPC upsert_quote_with_items:', rpcError)
      return {
        success: false,
        error: rpcError?.message || 'Erro ao processar orçamento no banco de dados',
      }
    }

    revalidatePath('/app/quotes')
    return { success: true, public_uuid: result.public_uuid, id: result.id }
  } catch (error) {
    console.error('Error in saveQuote:', error)
    return { 
      success: false, 
      error: 'Ocorreu um erro inesperado ao salvar o orçamento.' 
    }
  }
}


export async function deleteQuote(id: string) {
  try {
    if (!id || typeof id !== 'string') {
      return { success: false, error: 'ID do orçamento inválido' }
    }

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
  console.log('SERVER: updateQuoteStatus started', { id, status })
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const user = authData.user

    // Validação com Zod
    const validation = statusSchema.safeParse(status)
    if (!validation.success) {
      return { success: false, error: 'Status inválido' }
    }

    // Tenta atualizar por ID (UUID) ou Hash ID se necessário
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let query = supabase
      .from('quotes')
      .update({ status: validation.data })
      .eq('user_id', user.id)

    if (isUuid) {
      query = query.eq('id', id)
    } else {
      query = query.eq('hash_id', id)
    }

    const { error } = await query

    if (error) {
      console.error('Database error in updateQuoteStatus:', error)
      return { success: false, error: error.message }
    }

    try {
      revalidatePath(`/app/quotes/${id}`)
      revalidatePath('/app/quotes')
    } catch (revalidateError) {
      console.warn('Revalidation failed:', revalidateError)
    }
    return { success: true }
  } catch (error) {
    console.error('CRITICAL: Error updating quote status:', error)
    return { success: false, error: 'Erro interno ao atualizar status do orçamento' }
  }
}

export async function updatePublicQuoteStatus(uuid: string, status: string) {
  try {
    const supabase = await createClient()

    // Validar se o status é permitido para o cliente (público)
    if (!['accepted', 'rejected'].includes(status)) {
      return { success: false, error: 'Ação não permitida para o link público' }
    }

    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('public_uuid', uuid)

    if (error) {
      return { success: false, error: error.message }
    }

    try {
      revalidatePath(`/quote/${uuid}`)
    } catch (revalidateError) {
      console.warn('Public revalidation failed:', revalidateError)
    }
    return { success: true }
  } catch (error) {
    console.error('Error updating public quote status:', error)
    return { success: false, error: 'Erro interno ao processar sua resposta' }
  }
}


