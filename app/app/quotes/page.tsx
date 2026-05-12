import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuotesClient } from './quotes-client'

export default async function QuotesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: quotes } = await supabase
    .from('quotes')
    .select(
      `
      *,
      customers ( name )
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <QuotesClient initialQuotes={quotes || []} />
}
