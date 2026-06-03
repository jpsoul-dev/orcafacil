import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { ReceiptInput } from '@/app/app/quotes/schemas'

export async function getReceiptByQuoteId(quoteId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quote_receipts')
      .select('*')
      .eq('quote_id', quoteId)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching receipt by quote ID:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('CRITICAL: getReceiptByQuoteId failed:', error)
    return null
  }
}

export async function getReceiptById(receiptId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quote_receipts')
      .select('*')
      .eq('id', receiptId)
      .maybeSingle()

    if (error) {
      logger.error('Error fetching receipt by ID:', error)
      return null
    }

    return data
  } catch (error) {
    logger.error('CRITICAL: getReceiptById failed:', error)
    return null
  }
}

export async function saveReceipt(data: ReceiptInput, userId: string) {
  try {
    const supabase = await createClient()

    // 1. Validar a propriedade do orçamento (Evitar escalação de privilégios)
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, status')
      .eq('id', data.quoteId)
      .eq('user_id', userId)
      .single()

    if (quoteError || !quote) {
      logger.error('Orçamento não encontrado ou usuário sem permissão:', quoteError)
      return { success: false, error: 'Orçamento não encontrado ou permissão negada.' }
    }

    // 2. Verificar se já existe um recibo para este orçamento
    const { data: existingReceipt } = await supabase
      .from('quote_receipts')
      .select('id, receipt_number')
      .eq('quote_id', data.quoteId)
      .maybeSingle()

    if (existingReceipt) {
      // Modo Edição: atualiza dados do recibo existente
      const { error: updateError } = await supabase
        .from('quote_receipts')
        .update({
          title: data.title,
          amount: data.amount,
          payment_method: data.paymentMethod,
          services_description: data.servicesDescription,
          issued_at: data.issuedAt,
        })
        .eq('id', existingReceipt.id)
        .eq('user_id', userId)

      if (updateError) {
        logger.error('Error updating receipt:', updateError)
        return { success: false, error: 'Erro ao atualizar o recibo.' }
      }

      return { success: true, id: existingReceipt.id }
    } else {
      // Modo Criação: conta recibos do usuário para obter o número sequencial
      const { count, error: countError } = await supabase
        .from('quote_receipts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (countError) {
        logger.error('Error counting user receipts:', countError)
        return { success: false, error: 'Erro ao gerar o sequencial do recibo.' }
      }

      const nextNumber = (count || 0) + 1
      const receiptNumber = `REC-${String(nextNumber).padStart(3, '0')}`

      const { data: newReceipt, error: insertError } = await supabase
        .from('quote_receipts')
        .insert({
          user_id: userId,
          quote_id: data.quoteId,
          receipt_number: receiptNumber,
          title: data.title,
          amount: data.amount,
          payment_method: data.paymentMethod,
          services_description: data.servicesDescription,
          issued_at: data.issuedAt,
        })
        .select('id')
        .single()

      if (insertError || !newReceipt) {
        logger.error('Error inserting receipt:', insertError)
        return { success: false, error: 'Erro ao salvar o novo recibo.' }
      }

      return { success: true, id: newReceipt.id }
    }
  } catch (error) {
    logger.error('CRITICAL: saveReceipt failed:', error)
    return { success: false, error: 'Ocorreu um erro inesperado ao processar o recibo.' }
  }
}

export async function deleteReceipt(receiptId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('quote_receipts')
      .delete()
      .eq('id', receiptId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Error deleting receipt:', error)
      return { success: false, error: 'Erro ao excluir o recibo.' }
    }

    return { success: true }
  } catch (error) {
    logger.error('CRITICAL: deleteReceipt failed:', error)
    return { success: false, error: 'Ocorreu um erro inesperado ao excluir o recibo.' }
  }
}
