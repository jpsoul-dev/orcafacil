import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerService } from '@/lib/services/customer-service'
import { CustomersList } from './customers-list'
import { BackButton } from '@/components/ui/back-button'
import { CustomerForm } from './components/customer-form'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface CustomersPageProps {
  searchParams: SearchParams
}

/**
 * Server Component for the Customers route.
 * Delegates database logic to CustomerService per Principle I.
 * Matches CatalogPage visual layout and header patterns.
 */
export default async function CustomersPage({ searchParams }: CustomersPageProps) {
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
  const sort = typeof params.sort === 'string' ? params.sort : 'az'

  const pageNum = parseInt(page) || 0
  const sizeNum = parseInt(size) || 10
  const limitNum = parseInt(limit) || 0

  // Call the isolated customer service
  const result = await CustomerService.getCustomersPaged({
    userId: user.id,
    page: pageNum,
    size: sizeNum,
    limit: limitNum,
    search,
    sort,
  })

  if (!result.success) {
    throw new Error(result.error)
  }

  const customers = result.data?.customers || []
  const totalItems = result.data?.count || 0

  return (
    <div className="space-y-6 hide-mobile-tabbar pb-20 sm:pb-6">
      {/* Header da Página - Fixo (Sticky) no desktop, ocultado no mobile */}
      <div className="hidden sm:flex sticky top-0 z-30 bg-background/95 backdrop-blur-xs py-4 border-b border-border/50 items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-ds-heading-lg font-bold tracking-tight text-foreground font-display">
            Clientes
          </h2>
        </div>
        <div>
          <CustomerForm isSheet={true} />
        </div>
      </div>

      <CustomersList
        initialCustomers={customers}
        totalItems={totalItems}
        filters={{
          page: pageNum,
          size: sizeNum,
          limit: limitNum,
          search,
          sort,
        }}
      />
    </div>
  )
}
