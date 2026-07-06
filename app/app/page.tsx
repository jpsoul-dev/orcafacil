import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Users, Package, Receipt, ArrowRight, Plus, BarChart3 } from 'lucide-react'
import { ListContainer } from '@/components/ui/list-container'
import { QuoteItem } from './quotes/components/quote-item'
import type { Quote } from '@/types'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { reconcileStripeCheckout } from '@/lib/services/stripe-service'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double Validation: reconcile Stripe Checkout session if session_id is present in the URL
  const params = await searchParams
  const sessionId = typeof params?.session_id === 'string' ? params.session_id : undefined

  if (sessionId) {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const { shouldRedirect } = await reconcileStripeCheckout(
      sessionId,
      currentProfile?.subscription_status ?? null,
    )

    if (shouldRedirect) {
      redirect('/app')
    }
  }

  // Fetch recent quotes and user profile
  const [{ data: quotesData }, { data: profile }] = await Promise.all([
    supabase
      .from('vw_quotes')
      .select(`
        id,
        quote_number,
        title,
        total,
        status,
        created_at,
        customers ( name )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single()
  ])

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuário'
  const firstName = userName.split(' ')[0]

  const recentQuotes = (quotesData || []) as unknown as Quote[]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── SAUDAÇÃO E SUBTÍTULO ─────────────────────────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-ds-heading-lg font-bold text-foreground leading-ds-tight tracking-tight">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-ds-body-md text-muted-foreground">
          O que deseja fazer agora?
        </p>
      </div>

      {/* ── CARDS DE NAVEGAÇÃO RÁPIDA (MENU CARDS) ─────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
        {/* Card 1: Orçamentos (Destacado em Azul Primário) */}
        <Link href="/app/quotes" className="flex flex-col h-full group">
          <div className="relative overflow-hidden bg-primary hover:bg-primary/95 transition-all duration-ds-fast cursor-pointer p-4 flex-1 flex flex-col justify-between rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none min-h-28">
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-40 pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-white/20 shrink-0">
                <FileText className="size-5 text-white" />
              </div>
              <h3 className="text-ds-body-lg font-bold text-white leading-none">Orçamentos</h3>
            </div>
          </div>
        </Link>

        {/* Card 2: Clientes */}
        <Link href="/app/customers" className="flex flex-col h-full group">
          <div className="bg-card hover:bg-muted/40 border border-border transition-all duration-ds-fast cursor-pointer p-4 flex-1 flex flex-col justify-between rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none min-h-28">
            <div className="flex flex-col h-full justify-between gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0 transition-colors group-hover:bg-primary/10">
                <Users className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h3 className="text-ds-body-lg font-bold text-foreground leading-none">Clientes</h3>
            </div>
          </div>
        </Link>

        {/* Card 3: Catálogo */}
        <Link href="/app/catalog" className="flex flex-col h-full group">
          <div className="bg-card hover:bg-muted/40 border border-border transition-all duration-ds-fast cursor-pointer p-4 flex-1 flex flex-col justify-between rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none min-h-28">
            <div className="flex flex-col h-full justify-between gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0 transition-colors group-hover:bg-primary/10">
                <Package className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h3 className="text-ds-body-lg font-bold text-foreground leading-none">Catálogo</h3>
            </div>
          </div>
        </Link>

        {/* Card 4: Recibos */}
        <Link href="/app/receipts" className="flex flex-col h-full group">
          <div className="bg-card hover:bg-muted/40 border border-border transition-all duration-ds-fast cursor-pointer p-4 flex-1 flex flex-col justify-between rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 select-none min-h-28">
            <div className="flex flex-col h-full justify-between gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0 transition-colors group-hover:bg-primary/10">
                <Receipt className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              </div>
              <h3 className="text-ds-body-lg font-bold text-foreground leading-none">Recibos</h3>
            </div>
          </div>
        </Link>

        {/* Card 5: Relatórios (Não direciona a nenhum lugar, implementado no futuro) */}
        <div className="bg-card border border-border/80 opacity-70 p-4 flex flex-col justify-between rounded-lg shadow-xs select-none min-h-28 relative overflow-hidden">
          <div className="flex flex-col h-full justify-between gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
              <BarChart3 className="size-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-ds-body-lg font-bold text-foreground leading-none">Relatórios</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                Em breve
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO DE ORÇAMENTOS RECENTES ───────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-ds-heading-xs font-bold text-foreground">Orçamentos recentes</h2>
          {recentQuotes.length > 0 && (
            <Link
              href="/app/quotes"
              className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover hover:underline transition-colors duration-ds-fast flex items-center gap-1"
            >
              Ver todos <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        {recentQuotes.length > 0 ? (
          <ListContainer>
            {recentQuotes.map((quote) => (
              <QuoteItem key={quote.id} quote={quote} />
            ))}
          </ListContainer>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-card py-20 text-center shadow-sm select-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-ds-body-lg font-bold text-foreground">Nenhum orçamento recente</h3>
            <p className="text-ds-body-sm text-muted-foreground max-w-sm mt-1 mb-6">
              Você ainda não criou nenhum orçamento. Comece a criar para gerenciar seu negócio!
            </p>
            <SubscriptionGuard>
              <Link href="/app/quotes/new">
                <Button variant="default" className="font-semibold rounded-md">
                  <Plus className="mr-2 size-4" />
                  Criar primeiro orçamento
                </Button>
              </Link>
            </SubscriptionGuard>
          </div>
        )}
      </div>
    </div>
  )
}
