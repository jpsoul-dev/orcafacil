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
  
  let query = supabase.from('quotes').select('public_uuid')
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('hash_id', id)
  }

  const { data: quoteMeta, error: metaError } = await query.single()

  if (metaError || !quoteMeta) {
    notFound()
  }

  const { data: quote, error } = await supabase.rpc('get_public_quote', {
    p_uuid: quoteMeta.public_uuid,
  })

  if (error || !quote) {
    console.error('Erro ao buscar orçamento detalhado:', error)
    notFound()
  }


  return <QuoteViewer quote={quote} isAdmin={true} />
}
