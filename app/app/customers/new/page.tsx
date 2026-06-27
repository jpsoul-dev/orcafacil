import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerForm } from '../components/customer-form'

export default async function NewCustomerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-8">
      <CustomerForm mode="new" />
    </div>
  )
}
