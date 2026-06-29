import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerService } from '@/lib/services/customer-service'
import { CustomersList } from './customers-list'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

interface CustomersPageProps {
  searchParams: SearchParams
}

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

  const result = await CustomerService.getCustomersPaged({
    userId: user.id,
    page: pageNum,
    size: sizeNum,
    limit: limitNum,
    search,
    sort,
  })

  const customers = result.success && result.data ? result.data.customers : []
  const totalItems = result.success && result.data ? result.data.count : 0

  return (
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
  )
}
