import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAdminDashboardStats } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, TrendingUp, Clock } from 'lucide-react'
import { BroadcastForm } from './broadcast-form'
import { UsersTableClient, UserProfile } from './users-table-client'

export const metadata = {
  title: 'Gerenciamento Administrativo | OrçaFácil',
}

export default async function AdminUsersPage() {
  const supabase = await createSupabaseClient()

  // 1. Verificar se o usuário logado é admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!currentProfile?.is_admin) {
    redirect('/app') // Redireciona se não for admin
  }

  // 2. Buscar estatísticas do dashboard
  const stats = await getAdminDashboardStats()

  // 3. Buscar usuários e perfis usando Service Role Key


  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()
  if (authError) {
    console.error('Erro ao buscar usuários do auth:', authError)
    return <div className="p-8 text-red-500">Erro ao carregar lista de usuários.</div>
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('Erro ao buscar perfis:', profilesError)
    return <div className="p-8 text-red-500">Erro ao carregar dados dos perfis.</div>
  }

  // 3. Mesclar os dados
  const mergedUsers: UserProfile[] = profiles.map((profile) => {
    const authUser = authData.users.find((u) => u.id === profile.id)
    return {
      ...profile,
      email: authUser?.email || 'Sem e-mail',
    }
  })

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciamento Administrativo</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Visualize métricas, gerencie usuários e envie comunicados para toda a base.
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.mrr)}
            </div>
            <p className="text-xs text-muted-foreground">Assinaturas ativas no Stripe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Pagos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">Plano Pro em dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.activeTrials}</div>
            <p className="text-xs text-muted-foreground">Período de teste gratuito</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos (30d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usage.quotesLastMonth}</div>
            <p className="text-xs text-muted-foreground">Criados nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Tabela de Usuários com Filtros (Client Component) */}
        <UsersTableClient users={mergedUsers} />

        {/* Formulário de Comunicado */}

        <div className="space-y-6">
          <BroadcastForm />
        </div>
      </div>
    </div>
  )
}
