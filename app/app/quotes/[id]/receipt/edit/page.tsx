import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ReceiptForm } from '../../../components/receipt-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptEditPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Tenta buscar por ID (UUID) ou por Hash ID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  
  let query = supabase.from('vw_quotes').select('id')
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('hash_id', id)
  }

  const { data: quoteMeta, error: metaError } = await query.single()

  if (metaError || !quoteMeta) {
    notFound()
  }

  // Busca os detalhes do orçamento
  const { data: quote, error } = await supabase.rpc('get_quote_details', {
    p_quote_id: quoteMeta.id,
  })

  if (error || !quote) {
    console.error('Erro ao buscar orçamento para emissão do recibo:', error)
    notFound()
  }

  // Regra de Negócio: Apenas orçamentos com status 'completed' (Finalizado) podem ter recibo emitido/editado
  if (quote.status !== 'completed') {
    redirect(`/app/quotes/${id}`)
  }

  // Busca se já existe um recibo associado
  const { data: receipt } = await supabase
    .from('quote_receipts')
    .select('*')
    .eq('quote_id', quoteMeta.id)
    .maybeSingle()

  const initialData = receipt
    ? {
        id: receipt.id,
        title: receipt.title,
        amount: parseFloat(receipt.amount),
        payment_method: receipt.payment_method,
        services_description: receipt.services_description,
        issued_at: receipt.issued_at,
      }
    : null

  // Prepara os dados consolidados do orçamento para o form
  const quoteDataForForm = {
    id: quote.id,
    hash_id: quote.hash_id,
    title: quote.title,
    total: quote.total,
    payment_method: quote.payment_method,
    customer: {
      name: quote.customer?.name || 'Cliente',
      document: quote.customer?.document || '',
    },
  }

  return (
    <div className="py-8">
      <ReceiptForm quote={quoteDataForForm} initialData={initialData} />
    </div>
  )
}
