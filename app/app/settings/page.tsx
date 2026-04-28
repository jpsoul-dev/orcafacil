import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let company = null
  if (user) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()
    company = data
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações da Empresa</h2>
        <p className="text-muted-foreground">
          Gerencie as informações da sua empresa que aparecerão nos orçamentos.
        </p>
      </div>
      <SettingsForm initialData={company} />
    </div>
  )
}
