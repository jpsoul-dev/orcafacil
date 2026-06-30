import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CatalogForm } from './catalog-form'
import { CatalogList } from './catalog-list'
import { CatalogService } from '@/lib/services/catalog-service'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface CatalogPageProps {
  searchParams: SearchParams
}

/**
 * Server Component for the Catalog route.
 * delegates database logic to CatalogService per Principle I.
 */
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

  // Call the isolated catalog service
  const result = await CatalogService.getCatalogItemsPaged({
    userId: user.id,
    page: pageNum,
    size: sizeNum,
    limit: limitNum,
    search,
    type,
    sort,
  })

  if (!result.success) {
    throw new Error(result.error)
  }

  const { items: catalogItems, count: totalItems } = result.data

  return (
    <div className="space-y-6 hide-mobile-tabbar pb-20 sm:pb-6">
      {/* Header da Página - Fixo (Sticky) no desktop, ocultado no mobile */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-background/95 backdrop-blur-xs py-4 border-b border-border/50 items-center justify-between">
        <div>
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground font-display">
            Catálogo
          </h2>
        </div>
        <div>
          <CatalogForm />
        </div>
      </div>

      <CatalogList
        initialItems={catalogItems}
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
