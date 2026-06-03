import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuoteViewer } from '@/components/quote-viewer'

export default async function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  const { data: quote, error } = await supabase.rpc('get_quote_details', {
    p_quote_id: quoteMeta.id,
  })

  if (error || !quote) {
    console.error('Erro ao buscar orçamento detalhado:', error)
    notFound()
  }

  // Verifica se o orçamento já possui recibo associado
  const { data: receipt } = await supabase
    .from('quote_receipts')
    .select('id')
    .eq('quote_id', quoteMeta.id)
    .maybeSingle()

  const receiptId = receipt?.id || null

  return <QuoteViewer quote={quote} receiptId={receiptId} />
}
