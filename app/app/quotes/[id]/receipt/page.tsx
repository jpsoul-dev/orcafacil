import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ReceiptViewer } from '../../components/receipt-viewer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptDetailsPage({ params }: PageProps) {
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
    console.error('Erro ao buscar orçamento detalhado para o recibo:', error)
    notFound()
  }

  // Busca o recibo associado na tabela
  const { data: receipt, error: receiptError } = await supabase
    .from('quote_receipts')
    .select('*')
    .eq('quote_id', quoteMeta.id)
    .maybeSingle()

  // Fluxo inteligente: se o recibo ainda não existir, redireciona o usuário para emitir/criar o recibo
  if (receiptError || !receipt) {
    redirect(`/app/quotes/${id}/receipt/edit`)
  }

  // Mapear dados do recibo garantindo tipos adequados para o client component
  const receiptDataForViewer = {
    id: receipt.id,
    receipt_number: receipt.receipt_number,
    title: receipt.title,
    amount: parseFloat(receipt.amount),
    payment_method: receipt.payment_method,
    services_description: receipt.services_description,
    issued_at: receipt.issued_at,
  }

  // Mapear dados do orçamento simplificados para o client component
  const quoteDataForViewer = {
    id: quote.id,
    hash_id: quote.hash_id,
    company: {
      name: quote.company?.name || 'Empresa',
      phone: quote.company?.phone || '',
      address_street: quote.company?.address_street,
      address_number: quote.company?.address_number,
      address_neighborhood: quote.company?.address_neighborhood,
      address_city: quote.company?.address_city,
      address_state: quote.company?.address_state,
      address_zip: quote.company?.address_zip,
      address_complement: quote.company?.address_complement,
    },
    customer: {
      name: quote.customer?.name || 'Cliente',
      document: quote.customer?.document || '',
      phone: quote.customer?.phone || '',
      address_street: quote.customer?.address_street,
      address_number: quote.customer?.address_number,
      address_neighborhood: quote.customer?.address_neighborhood,
      address_city: quote.customer?.address_city,
      address_state: quote.customer?.address_state,
      address_zip: quote.customer?.address_zip,
    },
  }

  return (
    <div className="py-8">
      <ReceiptViewer receipt={receiptDataForViewer} quote={quoteDataForViewer} />
    </div>
  )
}
