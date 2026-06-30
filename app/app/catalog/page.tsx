import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CatalogForm, CatalogItem } from './catalog-form'
import { CatalogFilter } from './components/catalog-filter'
import { CatalogList } from './catalog-list'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface CatalogPageProps {
  searchParams: SearchParams
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const page = typeof params.page === 'string' ? params.page : '0'
  const size = typeof params.size === 'string' ? params.size : '10'
  const limit = typeof params.limit === 'string' ? params.limit : ''
  const search = typeof params.search === 'string' ? params.search.trim() : ''
  const type = typeof params.type === 'string' ? params.type : 'all'
  const sort = typeof params.sort === 'string' ? params.sort : 'az'

  const pageNum = parseInt(page) || 0
  const sizeNum = parseInt(size) || 10
  const limitNum = parseInt(limit) || 0

  let query = supabase
    .from('catalog_items')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  // Ordenação
  if (sort === 'za') {
    query = query.order('name', { ascending: false })
  } else if (sort === 'price_asc') {
    query = query.order('unit_price', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('unit_price', { ascending: false })
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else {
    // Padrão: 'az'
    query = query.order('name', { ascending: true })
  }

  // Paginação
  let start = pageNum * sizeNum
  let end = start + sizeNum - 1

  if (limitNum > 0) {
    start = 0
    end = limitNum - 1
  }

  query = query.range(start, end)

  const { data: items, count } = await query

  const catalogItems = items || []
  const totalItems = count || 0

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground font-display">
            Serviços e Produtos
          </h2>
        </div>
        <CatalogForm />
      </div>

      <CatalogFilter />

      <CatalogList
        initialItems={catalogItems as (CatalogItem & { created_at: string; unit_measure: string | null })[]}
        totalItems={totalItems}
        filters={{
          page: pageNum,
          size: sizeNum,
          limit: limitNum,
          search,
          sort,
          type,
        }}
      />
    </div>
  )
}
