import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReceiptsList } from './receipts-list'
import { getReceiptsList, getReceiptsTypesCount } from '@/lib/services/receipt-service'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface ReceiptsPageProps {
  searchParams: SearchParams
}

export default async function ReceiptsPage({ searchParams }: ReceiptsPageProps) {
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
  const receiptType = typeof params.type === 'string' ? params.type : 'all'
  const from = typeof params.from === 'string' ? params.from : ''
  const to = typeof params.to === 'string' ? params.to : ''
  const sort = typeof params.sort === 'string' ? params.sort : 'newest'

  const pageNum = parseInt(page, 10) || 0
  const sizeNum = parseInt(size, 10) || 10
  const limitNum = parseInt(limit, 10) || 0

  // 1. Buscamos as contagens agregadas por tipo para o painel de filtros
  const typeCounts = await getReceiptsTypesCount(user.id)

  // 2. Buscamos a lista filtrada de recibos e a contagem total do serviço
  const { receipts, total } = await getReceiptsList({
    userId: user.id,
    search,
    receiptType,
    from,
    to,
    sort,
    limit: limitNum,
    page: pageNum,
    size: sizeNum,
  })

  return (
    <div className="hide-mobile-tabbar pb-20 sm:pb-6">
      <ReceiptsList
        initialReceipts={receipts}
        totalItems={total}
        typeCounts={typeCounts}
        filters={{
          page: pageNum,
          size: sizeNum,
          limit: limitNum,
          search,
          receiptType,
          from,
          to,
          sort,
        }}
      />
    </div>
  )
}

