import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Quote } from '@/types/quote'

export async function getQuoteDetails(quoteId: string): Promise<Quote | null> {
  try {
    const supabase = await createClient()

    // 1. Identificar se o ID fornecido é um UUID válido ou um número sequencial (quote_number)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(quoteId)
    let query = supabase.from('vw_quotes').select('id')

    if (isUuid) {
      query = query.eq('id', quoteId)
    } else {
      const isNumeric = /^\d+$/.test(quoteId)
      if (isNumeric) {
        query = query.eq('quote_number', parseInt(quoteId, 10))
      } else {
        logger.warn(`getQuoteDetails: ID do orçamento inválido fornecido: ${quoteId}`)
        return null
      }
    }

    const { data: quoteMeta, error: metaError } = await query.single()

    if (metaError || !quoteMeta) {
      logger.error('getQuoteDetails: Orçamento não encontrado ou acesso não autorizado na vw_quotes:', metaError)
      return null
    }

    // 2. Chamar a RPC get_quote_details que herda o contexto do usuário (auth.uid() no RLS)
    const { data: quote, error } = await supabase.rpc('get_quote_details', {
      p_quote_id: quoteMeta.id,
    })

    if (error || !quote) {
      logger.error('getQuoteDetails: Erro ao executar RPC get_quote_details:', error)
      return null
    }

    return quote as Quote
  } catch (error) {
    logger.error('getQuoteDetails: Erro crítico no serviço de orçamentos:', error)
    return null
  }
}
