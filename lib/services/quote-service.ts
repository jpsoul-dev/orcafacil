import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export type CloneQuoteResult =
  | { success: true; id: string; error?: never }
  | { success: false; error: string; id?: never }

export async function cloneQuote(quoteId: string, userId: string): Promise<CloneQuoteResult> {
  try {
    const supabase = await createClient()

    // 1. Buscar o orçamento original garantindo a propriedade (isolamento de tenant)
    const { data: originalQuote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', userId)
      .single()

    if (quoteError || !originalQuote) {
      logger.error('Erro ao buscar orçamento original para clonagem:', quoteError)
      return { success: false, error: 'Orçamento não encontrado ou permissão negada.' }
    }

    // Restrição da especificação: Não deve ser possível clonar um rascunho (draft)
    if (originalQuote.status === 'draft') {
      return { success: false, error: 'Não é possível clonar um orçamento em estado de rascunho.' }
    }

    // 2. Buscar os itens do orçamento original
    const { data: originalItems, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    if (itemsError) {
      logger.error('Erro ao buscar itens do orçamento para clonagem:', itemsError)
      return { success: false, error: 'Falha ao recuperar itens do orçamento original.' }
    }

    // 3. Criar o novo orçamento como 'draft'
    const clonedTitle = originalQuote.title ? `${originalQuote.title} (Cópia)` : 'Orçamento Clonado'
    const { data: clonedQuote, error: insertQuoteError } = await supabase
      .from('quotes')
      .insert({
        user_id: userId,
        customer_id: originalQuote.customer_id,
        discount_type: originalQuote.discount_type,
        discount_value: originalQuote.discount_value,
        notes: originalQuote.notes,
        payment_method: originalQuote.payment_method,
        subtotal: originalQuote.subtotal,
        total: originalQuote.total,
        title: clonedTitle,
        status: 'draft',
      })
      .select('id')
      .single()

    if (insertQuoteError || !clonedQuote) {
      logger.error('Erro ao criar orçamento clonado:', insertQuoteError)
      return { success: false, error: 'Erro ao salvar o orçamento clonado.' }
    }

    // 4. Se houver itens, inseri-los vinculados ao novo orçamento
    if (originalItems && originalItems.length > 0) {
      const clonedItems = originalItems.map(item => ({
        quote_id: clonedQuote.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        unit_measure: item.unit_measure,
        catalog_item_id: item.catalog_item_id
      }))

      const { error: insertItemsError } = await supabase
        .from('quote_items')
        .insert(clonedItems)

      if (insertItemsError) {
        logger.error('Erro ao inserir itens no orçamento clonado:', insertItemsError)
        // Rollback do orçamento inserido
        await supabase.from('quotes').delete().eq('id', clonedQuote.id)
        return { success: false, error: 'Erro ao duplicar os itens do orçamento.' }
      }
    }

    return { success: true, id: clonedQuote.id }
  } catch (error) {
    logger.error('CRITICAL: cloneQuote failed:', error)
    return { success: false, error: 'Erro inesperado ao realizar a clonagem do orçamento.' }
  }
}
