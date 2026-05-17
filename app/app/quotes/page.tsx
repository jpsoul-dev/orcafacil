import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuotesList } from './quotes-list'

export default async function QuotesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: quotes } = await supabase
    .from('vw_quotes')
    .select(
      `
      *,
      customers ( name )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <QuotesList initialQuotes={quotes || []} />
}
