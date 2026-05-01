import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText, Users, Package, Plus, ArrowRight, TrendingUp
} from 'lucide-react'
import { QuotesChart } from './components/quotes-chart'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ count: quotesCount }, { count: customersCount }, { count: catalogCount }, { data: quotesData }] = await Promise.all([
    supabase.from('quotes').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('catalog_items').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('created_at').order('created_at', { ascending: true })
  ])


  const firstName = user?.email?.split('@')[0] ?? 'Usuário'

  const stats = [
    {
      label: 'Orçamentos Gerados',
      value: quotesCount ?? 0,
      icon: FileText,
      href: '/app/quotes',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Clientes Cadastrados',
      value: customersCount ?? 0,
      icon: Users,
      href: '/app/customers',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Itens no Catálogo',
      value: catalogCount ?? 0,
      icon: Package,
      href: '/app/catalog',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  const quickActions = [
    {
      label: 'Novo Orçamento',
      description: 'Gere um orçamento em minutos',
      href: '/app/quotes/new',
      icon: FileText,
      primary: true,
    },
    {
      label: 'Adicionar Cliente',
      description: 'Cadastre um novo cliente',
      href: '/app/customers',
      icon: Users,
      primary: false,
    },
    {
      label: 'Novo Item no Catálogo',
      description: 'Adicione produtos ou serviços',
      href: '/app/catalog',
      icon: Package,
      primary: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-xl gradient-primary p-6 text-white shadow-md">
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium">Bem-vindo de volta,</p>
          <p className="text-white/75 text-sm mt-2 max-w-md">
            Você tem <strong className="text-white">{quotesCount ?? 0} orçamentos</strong> gerados este mês.
            {!quotesCount ? ' Crie seu primeiro orçamento agora!' : ' Continue assim!'}
          </p>
          <Link href="/app/quotes/new" className="mt-4 inline-flex items-center gap-2">
            <Button size="sm" className="bg-white text-primary hover:bg-white/90 font-semibold h-9 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Novo Orçamento
            </Button>
          </Link>
        </div>
        {/* Decoração */}
        <div className="absolute right-0 top-0 h-full w-48 opacity-10">
          <TrendingUp className="h-full w-full" strokeWidth={0.5} />
        </div>
      </div>
      
      {/* Gráfico de Orçamentos */}
      <QuotesChart quotes={quotesData || []} />

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Ações Rápidas
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className={`card-hover cursor-pointer border-border/60 ${action.primary ? 'bg-primary text-primary-foreground border-primary' : ''}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.primary ? 'bg-white/20' : 'bg-muted'}`}>
                    <action.icon className={`h-4 w-4 ${action.primary ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${action.primary ? 'text-primary-foreground' : ''}`}>{action.label}</p>
                    <p className={`text-xs mt-0.5 ${action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
