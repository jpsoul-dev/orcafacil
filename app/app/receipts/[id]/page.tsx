import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getReceiptDetails } from '@/lib/services/receipt-service'
import { ReceiptViewer } from '../../quotes/components/receipt-viewer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca os detalhes consolidados do recibo (avulso ou vinculado), itens, cliente e empresa
  const details = await getReceiptDetails(id, user.id)

  if (!details) {
    notFound()
  }

  const { receipt, quote } = details
  const isStandalone = quote.quote_number === 0

  return (
    <div className="py-8">
      <ReceiptViewer
        receipt={receipt}
        quote={quote}
        isStandalone={isStandalone}
      />
    </div>
  )
}

