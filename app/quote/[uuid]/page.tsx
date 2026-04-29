import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { QuoteViewer } from '@/components/quote-viewer'

export default async function PublicQuotePage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params
  const supabase = await createClient()

  // @ts-ignore
  const { data: quote, error } = await supabase.rpc('get_public_quote', { p_uuid: uuid })

  if (error || !quote) {
    console.error(error)
    notFound()
  }

  return (
    <QuoteViewer quote={quote} isAdmin={false} />
  )
}
