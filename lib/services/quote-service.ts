import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { Quote as ListQuote } from '@/types'
import { Quote as DetailedQuote } from '@/types/quote'

export interface GetQuotesParams {
  userId: string
  search?: string
  status?: string
  from?: string
  to?: string
  sort?: string
  limit?: number
  page?: number
  size?: number
}

export async function getQuoteDetails(quoteId: string): Promise<DetailedQuote | null> {
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

    return quote as DetailedQuote
  } catch (error) {
    logger.error('getQuoteDetails: Erro crítico no serviço de orçamentos:', error)
    return null
  }
}

export async function getQuotesList(params: GetQuotesParams): Promise<{ quotes: ListQuote[]; total: number }> {
  try {
    const supabase = await createClient()
    const { userId, search, status, from, to, sort, limit = 0, page = 0, size = 10 } = params

    // 1. Se houver busca textual, fazemos uma busca prévia por clientes para obter os IDs correspondentes
    let matchedCustomerIds: string[] = []
    if (search) {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', `%${search}%`)

      if (customerError) {
        logger.error('getQuotesList: Error searching customers:', customerError)
      } else if (customers && customers.length > 0) {
        matchedCustomerIds = customers.map((c) => c.id)
      }
    }

    // 2. Montamos a query de orçamentos filtrados e paginados no Supabase
    let query = supabase
      .from('vw_quotes')
      .select(`
        *,
        customers ( name ),
        quote_receipts ( id )
      `, { count: 'exact' })
      .eq('user_id', userId)

    // Filtro de Status
    if (status && status !== 'all') {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean)
      if (statuses.length > 0) {
        query = query.in('status', statuses)
      }
    }

    // Filtros de Data
    if (from) {
      query = query.gte('created_at', `${from}T00:00:00.000Z`)
    }
    if (to) {
      query = query.lte('created_at', `${to}T23:59:59.999Z`)
    }

    // Filtro de Busca Textual combinado com IDs de clientes encontrados
    if (search) {
      const isNumeric = /^\d+$/.test(search)
      let orConditions = `title.ilike.%${search}%`

      if (isNumeric) {
        orConditions += `,quote_number.eq.${search}`
      }

      if (matchedCustomerIds.length > 0) {
        orConditions += `,customer_id.in.(${matchedCustomerIds.map((id) => `"${id}"`).join(',')})`
      }

      query = query.or(orConditions)
    }

    // Ordenação
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sort === 'highest_value') {
      query = query.order('total', { ascending: false })
    } else if (sort === 'lowest_value') {
      query = query.order('total', { ascending: true })
    } else {
      // Padrão: 'newest'
      query = query.order('created_at', { ascending: false })
    }

    // Paginação / Limites
    let start = page * size
    let end = start + size - 1

    // No mobile, a paginação é acumulativa (Carregar Mais) enviando o limite diretamente
    if (limit > 0) {
      start = 0
      end = limit - 1
    }

    query = query.range(start, end)

    const { data: quotes, count, error } = await query

    if (error) {
      logger.error('getQuotesList: Error executing supabase query:', error)
      throw error
    }

    return {
      quotes: (quotes as ListQuote[]) || [],
      total: count || 0,
    }
  } catch (error) {
    logger.error('getQuotesList: Critical error in getQuotesList service:', error)
    return { quotes: [], total: 0 }
  }
}

export async function getQuotesAllStatuses(userId: string): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quotes')
      .select('status')
      .eq('user_id', userId)

    if (error) {
      logger.error('getQuotesAllStatuses: Error fetching statuses:', error)
      throw error
    }

    return data?.map((q) => q.status as string) || []
  } catch (error) {
    logger.error('getQuotesAllStatuses: Critical error in getQuotesAllStatuses service:', error)
    return []
  }
}
