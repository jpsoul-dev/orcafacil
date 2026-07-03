import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuotesList } from './quotes-list'
import { getQuotesList, getQuotesAllStatuses } from '@/lib/services/quote-service'

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

  const pageNum = parseInt(page, 10) || 0
  const sizeNum = parseInt(size, 10) || 10
  const limitNum = parseInt(limit, 10) || 0

  // 1. Buscamos todas as marcas de status de forma leve
  const rawStatuses = await getQuotesAllStatuses(user.id)

  // 2. Buscamos a lista filtrada de orçamentos e contagem total do serviço
  const { quotes, total } = await getQuotesList({
    userId: user.id,
    search,
    status,
    from,
    to,
    sort,
    limit: limitNum,
    page: pageNum,
    size: sizeNum,
  })

  return (
    <div className="hide-mobile-tabbar pb-20 sm:pb-6">
      <QuotesList
        initialQuotes={quotes}
        totalItems={total}
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
    </div>
  )
}

