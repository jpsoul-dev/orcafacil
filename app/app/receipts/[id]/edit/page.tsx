import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getStandaloneReceiptDetails } from '@/lib/services/receipt-service'
import { StandaloneReceiptForm } from '../../components/standalone-receipt-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditStandaloneReceiptPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca concorrente de detalhes do recibo, clientes e catálogo
  const [details, customersResult, catalogResult] = await Promise.all([
    getStandaloneReceiptDetails(id, user.id),
    supabase
      .from('customers')
      .select('*')
      .order('name'),
    supabase
      .from('catalog_items')
      .select('*')
      .order('name'),
  ])

  if (!details) {
    notFound()
  }

  const { receipt, items } = details

  // Mapear dados do recibo para a estrutura esperada pelo formulário
  const initialDataForForm = {
    id: receipt.id,
    customer_id: receipt.customer_id || '',
    title: receipt.title,
    amount: parseFloat(receipt.amount),
    payment_method: receipt.payment_method || 'Pix',
    services_description: receipt.services_description || '',
    issued_at: receipt.issued_at,
    items: items.map((item) => ({
      id: item.id,
      item_name: item.item_name,
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      subtotal: parseFloat(item.subtotal),
    })),
  }

  return (
    <div className="py-8">
      <StandaloneReceiptForm
        customers={customersResult.data || []}
        catalogItems={catalogResult.data || []}
        initialData={initialDataForForm}
      />
    </div>
  )
}
