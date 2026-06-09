import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReceiptsList } from './receipts-list'

export default async function ReceiptsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca todos os recibos da view vw_receipts ordenados por data de emissão decrescente
  const { data: receipts } = await supabase
    .from('vw_receipts')
    .select('*')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false })

  return <ReceiptsList initialReceipts={receipts || []} />
}
