'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

import { 
  statusSchema, 
  quoteSchema, 
  type QuoteInput,
  cancelQuoteSchema
} from './schemas'


export async function saveQuote(data: QuoteInput) {
  try {
    const validation = quoteSchema.safeParse(data)
    if (!validation.success) {
      logger.error('Validação de orçamento falhou:', validation.error.format())
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

    if (id) {
      const { data: existingQuote } = await supabase
        .from('vw_quotes')
        .select('status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!existingQuote) {
        return { success: false, error: 'Orçamento não encontrado' }
      }

      if (['expired', 'approved', 'rejected', 'cancelled', 'completed'].includes(existingQuote.status)) {
        return { success: false, error: 'Não é possível editar um orçamento expirado, cancelado ou finalizado.' }
      }
    }

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
      p_payment_method: quoteData.payment_method || null
    })

    if (!rpcError && result) {
      revalidatePath('/app/quotes')
      return { success: true, id: result.id }
    }

    logger.error('Erro na RPC upsert_quote_with_items:', rpcError)
    return {
      success: false,
      error: rpcError?.message || 'Erro ao processar orçamento no banco de dados',
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

    // Busca o status atual antes de deletar
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !quote) {
      return { success: false, error: 'Orçamento não encontrado.' }
    }

    if (quote.status !== 'draft') {
      return { success: false, error: 'Apenas rascunhos podem ser excluídos fisicamente.' }
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

export async function updateQuoteStatus(id: string, status: string, cancellationReason?: string) {
  logger.info('SERVER: updateQuoteStatus started', { id, status, cancellationReason })
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

    const validatedStatus = validation.data

    // Validação específica de motivo de cancelamento
    let validatedCancellationReason: string | null = null
    if (validatedStatus === 'cancelled') {
      const cancelValidation = cancelQuoteSchema.safeParse({
        quoteId: id,
        cancellationReason
      })
      if (!cancelValidation.success) {
        const errorMsg = cancelValidation.error.issues[0]?.message || 'Motivo de cancelamento inválido'
        return { success: false, error: errorMsg }
      }
      validatedCancellationReason = cancellationReason || null
    }

    // Tenta atualizar por ID (UUID) ou quote_number se necessário
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    let checkQuery = supabase.from('vw_quotes').select('status').eq('user_id', user.id)
    if (isUuid) {
      checkQuery = checkQuery.eq('id', id)
    } else {
      const isNumeric = /^\d+$/.test(id)
      if (isNumeric) {
        checkQuery = checkQuery.eq('quote_number', parseInt(id, 10))
      } else {
        return { success: false, error: 'Código de orçamento inválido' }
      }
    }

    const { data: existingQuote } = await checkQuery.single()
    if (!existingQuote) {
      return { success: false, error: 'Orçamento não encontrado' }
    }

    if (existingQuote.status === 'expired') {
      return { success: false, error: 'Não é possível alterar o status de um orçamento expirado' }
    }
    
    const updatePayload: Record<string, any> = { status: validatedStatus }
    if (validatedStatus === 'cancelled') {
      updatePayload.cancellation_reason = validatedCancellationReason;
    }

    let query = supabase
      .from('quotes')
      .update(updatePayload)
      .eq('user_id', user.id)

    if (isUuid) {
      query = query.eq('id', id)
    } else {
      const isNumeric = /^\d+$/.test(id)
      if (isNumeric) {
        query = query.eq('quote_number', parseInt(id, 10))
      } else {
        return { success: false, error: 'Código de orçamento inválido' }
      }
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
      .update({ status: 'pending', valid_until: validUntil, cancellation_reason: null })
      .eq('user_id', user.id)
      .in('status', ['pending', 'rejected', 'cancelled'])

    if (isUuid) {
      query = query.eq('id', id)
    } else {
      const isNumeric = /^\d+$/.test(id)
      if (isNumeric) {
        query = query.eq('quote_number', parseInt(id, 10))
      } else {
        return { success: false, error: 'Código de orçamento inválido' }
      }
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
