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

  const { data: quoteMeta } = await supabase
    .from('quotes')
    .select('public_uuid')
    .eq('id', id)
    .single()

  if (!quoteMeta) {
    notFound()
  }

  const { data: quote, error } = await supabase.rpc('get_public_quote', {
    p_uuid: quoteMeta.public_uuid,
  })

  if (error || !quote) {
    console.error(error)
    notFound()
  }

  return <QuoteViewer quote={quote} isAdmin={true} />
}
