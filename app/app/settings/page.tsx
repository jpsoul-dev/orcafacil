import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from './settings-form'
import { Settings } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações da Empresa</h2>
          <p className="text-muted-foreground text-sm">
            Informações que aparecerão nos seus orçamentos.
          </p>
        </div>
      </div>
      <SettingsForm initialData={company} />
    </div>
  )
}
