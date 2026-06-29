import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuotesList } from './quotes-list'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface QuotesPageProps {
  searchParams: SearchParams
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const page = typeof params.page === 'string' ? params.page : '0'
  const size = typeof params.size === 'string' ? params.size : '10'
  const limit = typeof params.limit === 'string' ? params.limit : ''
  const search = typeof params.search === 'string' ? params.search.trim() : ''
  const status = typeof params.status === 'string' ? params.status : 'all'
  const from = typeof params.from === 'string' ? params.from : ''
  const to = typeof params.to === 'string' ? params.to : ''
  const sort = typeof params.sort === 'string' ? params.sort : 'newest'

  // 1. Buscamos a contagem total por status de todos os registros do usuário de forma leve
  const { data: allStatuses } = await supabase
    .from('quotes')
    .select('status')
    .eq('user_id', user.id)

  // 2. Se houver busca textual, fazemos uma busca prévia por clientes para obter os IDs correspondentes
  let matchedCustomerIds: string[] = []
  if (search) {
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .ilike('name', `%${search}%`)
    
    if (customers && customers.length > 0) {
      matchedCustomerIds = customers.map((c) => c.id)
    }
  }

  // 3. Montamos a query de orçamentos filtrados e paginados no Supabase
  let query = supabase
    .from('vw_quotes')
    .select(`
      *,
      customers ( name ),
      quote_receipts ( id )
    `, { count: 'exact' })
    .eq('user_id', user.id)

  // Filtro de Status
  if (status !== 'all') {
    query = query.eq('status', status)
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
  const pageNum = parseInt(page) || 0
  const sizeNum = parseInt(size) || 10
  const limitNum = parseInt(limit) || 0

  let start = pageNum * sizeNum
  let end = start + sizeNum - 1

  // No mobile, a paginação é acumulativa (Carregar Mais) enviando o limite diretamente
  if (limitNum > 0) {
    start = 0
    end = limitNum - 1
  }

  query = query.range(start, end)

  const { data: quotes, count, error } = await query

  if (error) {
    console.error('Error fetching quotes server-side:', error)
  }

  // Mapeamos os status para simplificar a estrutura enviada
  const rawStatuses = allStatuses?.map(q => q.status) || []

  return (
    <QuotesList
      initialQuotes={quotes || []}
      totalItems={count || 0}
      allStatuses={rawStatuses}
      filters={{
        page: pageNum,
        size: sizeNum,
        limit: limitNum,
        search,
        status,
        from,
        to,
        sort,
      }}
    />
  )
}
