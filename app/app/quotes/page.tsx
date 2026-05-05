import { createClient } from '@/lib/supabase/server'
import { QuotesClient } from './quotes-client'

export default async function QuotesPage() {
  const supabase = await createClient()

  const { data: quotes } = await supabase
    .from('quotes')
    .select(
      `
      *,
      customers ( name )
    `,
    )
    .order('created_at', { ascending: false })

  return <QuotesClient initialQuotes={quotes || []} />
}
