import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getStandaloneReceiptDetails } from '@/lib/services/receipt-service'
import { ReceiptViewer } from '../../quotes/components/receipt-viewer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StandaloneReceiptDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca os detalhes consolidados do recibo avulso, itens, cliente e empresa
  const details = await getStandaloneReceiptDetails(id, user.id)

  if (!details) {
    notFound()
  }

  const { receipt, items, customer, company } = details

  // Mapear dados do recibo garantindo tipos adequados para o client component
  const receiptDataForViewer = {
    id: receipt.id,
    receipt_number: receipt.receipt_number,
    title: receipt.title,
    amount: parseFloat(receipt.amount),
    payment_method: receipt.payment_method || 'Pix',
    services_description: receipt.services_description || '',
    issued_at: receipt.issued_at,
  }

  // Mapear dados fictícios de "quote" simplificados para o client component reusar o layout
  const quoteDataForViewer = {
    id: receipt.id, // ID do recibo serve como id do quote nesse contexto para fins de links
    quote_number: 0, // 0 ou null indica recibo avulso
    title: receipt.title,
    company: {
      name: company?.name || 'Empresa',
      phone: company?.phone || '',
      cnpj: company?.cnpj || '',
      address_street: company?.address_street,
      address_number: company?.address_number,
      address_neighborhood: company?.address_neighborhood,
      address_city: company?.address_city,
      address_state: company?.address_state,
      address_zip: company?.address_zip,
      address_complement: company?.address_complement,
    },
    customer: {
      name: customer?.name || 'Cliente',
      document: customer?.document || '',
      phone: customer?.phone || '',
      address_street: customer?.address_street,
      address_number: customer?.address_number,
      address_neighborhood: customer?.address_neighborhood,
      address_city: customer?.address_city,
      address_state: customer?.address_state,
      address_zip: customer?.address_zip,
    },
    items: items.map((item) => ({
      item_name: item.item_name,
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
      subtotal: parseFloat(item.subtotal),
    })),
  }

  return (
    <div className="py-8">
      <ReceiptViewer
        receipt={receiptDataForViewer}
        quote={quoteDataForViewer}
        isStandalone={true}
      />
    </div>
  )
}
