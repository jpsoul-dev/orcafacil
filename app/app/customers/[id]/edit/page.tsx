import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { CustomerForm } from '../../components/customer-form'
import { CustomerService } from '@/lib/services/customer-service'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const customerResult = await CustomerService.getCustomerById(id, user.id)
  
  if (!customerResult.success || !customerResult.data) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-8">
      <CustomerForm initialData={customerResult.data} mode="edit" />
    </div>
  )
}
