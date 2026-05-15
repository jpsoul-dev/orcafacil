'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateRandomHash } from '@/lib/hashids'
import { logger } from '@/lib/logger'

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

    let attempts = 0
    const MAX_ATTEMPTS = 3

    while (attempts < MAX_ATTEMPTS) {
      const currentHashId = id ? null : generateRandomHash()

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
        p_hash_id: currentHashId
      })

      if (!rpcError && result) {
        revalidatePath('/app/quotes')
        return { success: true, public_uuid: result.public_uuid, id: result.id }
      }

      // Se o erro for de unicidade (código 23505) e estamos criando um novo (id é null)
      if (rpcError?.code === '23505' && !id) {
        attempts++
        logger.warn(`Colisão de hash_id detectada. Tentativa ${attempts} de ${MAX_ATTEMPTS}...`)
        continue
      }

      // Se for outro erro ou estourou as tentativas
      logger.error('Erro na RPC upsert_quote_with_items:', rpcError)
      return {
        success: false,
        error: rpcError?.message || 'Erro ao processar orçamento no banco de dados',
      }
    }

    logger.error('Falha ao gerar hash_id único após 3 tentativas.')
    return { 
      success: false, 
      error: 'Não foi possível gerar um identificador único para o orçamento após várias tentativas. Por favor, tente novamente.' 
    }
  } catch (error) {
    logger.error('Error in saveQuote:', error)
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
    logger.error('Error deleting quote:', error)
    return { success: false, error: 'Erro interno ao deletar orçamento' }
  }
}

export async function updateQuoteStatus(id: string, status: string) {
  logger.info('SERVER: updateQuoteStatus started', { id, status })
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
      logger.error('Database error in updateQuoteStatus:', error)
      return { success: false, error: error.message }
    }

    try {
      revalidatePath(`/app/quotes/${id}`)
      revalidatePath('/app/quotes')
    } catch (revalidateError) {
      logger.warn('Revalidation failed:', revalidateError)
    }
    return { success: true }
  } catch (error) {
    logger.error('CRITICAL: Error updating quote status:', error)
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
      logger.warn('Public revalidation failed:', revalidateError)
    }
    return { success: true }
} catch (error) {
    logger.error('Error updating public quote status:', error)
    return { success: false, error: 'Erro interno ao processar sua resposta' }
  }
}

export async function reopenQuote(id: string, validUntil: string) {
  try {
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const user = authData.user

    // Validação mínima de data
    if (!validUntil || typeof validUntil !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) {
      return { success: false, error: 'Data de validade inválida' }
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let query = supabase
      .from('quotes')
      .update({ status: 'open', valid_until: validUntil })
      .eq('user_id', user.id)
      .eq('status', 'expired') // Extra safeguard

    if (isUuid) {
      query = query.eq('id', id)
    } else {
      query = query.eq('hash_id', id)
    }

    const { error } = await query

    if (error) {
      logger.error('Database error in reopenQuote:', error)
      return { success: false, error: error.message }
    }

    try {
      revalidatePath(`/app/quotes/${id}`)
      revalidatePath('/app/quotes')
    } catch (revalidateError) {
      logger.warn('Revalidation failed:', revalidateError)
    }
    return { success: true }
  } catch (error) {
    logger.error('CRITICAL: Error reopening quote:', error)
    return { success: false, error: 'Erro interno ao reabrir o orçamento' }
  }
}

