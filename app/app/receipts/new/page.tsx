import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StandaloneReceiptForm } from '../components/standalone-receipt-form'

export default async function NewStandaloneReceiptPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca concorrente de clientes e catálogo de itens cadastrados pelo usuário
  const [customersResult, catalogResult] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .order('name'),
    supabase
      .from('catalog_items')
      .select('*')
      .order('name'),
  ])

  if (customersResult.error) {
    console.error('Error fetching customers:', customersResult.error)
  }

  if (catalogResult.error) {
    console.error('Error fetching catalog items:', catalogResult.error)
  }

  return (
    <div className="py-8">
      <StandaloneReceiptForm
        customers={customersResult.data || []}
        catalogItems={catalogResult.data || []}
        initialData={null}
      />
    </div>
  )
}
