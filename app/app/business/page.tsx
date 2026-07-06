import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessForm } from './business-form'

export default async function BusinessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="w-full">
      <BusinessForm initialData={company} />
    </div>
  )
}

