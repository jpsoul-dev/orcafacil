import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerService } from '@/lib/services/customer-service'
import { CustomersList } from './customers-list'

export default async function CustomersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await CustomerService.getCustomers(user.id)
  const customers = result.success ? result.data : []

  return <CustomersList initialCustomers={customers} />
}
