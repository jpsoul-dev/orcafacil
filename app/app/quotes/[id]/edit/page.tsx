import { createClient } from '@/lib/supabase/server'
import { QuotePageContent } from '../../components/quote-page-content'
import { notFound } from 'next/navigation'


export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Tenta buscar por ID (UUID) ou por Código Sequencial (quote_number)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  
  let targetId = id

  if (!isUuid) {
    const isNumeric = /^\d+$/.test(id)
    if (isNumeric) {
      const { data: quote } = await supabase
        .from('vw_quotes')
        .select('id')
        .eq('quote_number', parseInt(id, 10))
        .single()
      
      if (quote) {
        targetId = quote.id
      } else {
        notFound()
      }
    } else {
      notFound()
    }
  }

  return <QuotePageContent id={targetId} mode="edit" />

}
