import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FileText, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { QuotesChart } from './components/quotes-chart'
import { StatusPieChart } from './components/status-pie-chart'
import { RevenueBarChart } from './components/revenue-bar-chart'
import { SubscriptionGuard } from '@/components/subscription-guard'
import { reconcileStripeCheckout } from '@/lib/services/stripe-service'

const TRIAL_DURATION_DAYS = 15

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

  const now = new Date()

  const [{ data: quotesData }, { data: profile }] = await Promise.all(
    [
      supabase
        .from('vw_quotes')
        .select('created_at, status, total')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', user.id)
        .single()
    ],
  )

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuário'
  const firstName = userName.split(' ')[0]

  // Subscription and trial business rules
  const isActive = profile?.subscription_status === 'active'
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
  const timeRemaining = trialEndsAt.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)))
  
  // User is trialing only if status is trialing AND there are remaining days
  const isTrialing = profile?.subscription_status === 'trialing' && daysRemaining > 0
  const isExpired = !isActive && !isTrialing
  
  const trialPercentage = Math.min(((TRIAL_DURATION_DAYS - daysRemaining) / TRIAL_DURATION_DAYS) * 100, 100)
  const isNearLimit = isTrialing && daysRemaining <= 3

  return (
    <div className="space-y-8">
      {/* Welcome / Upgrade Banner (only shown for users without an active subscription) */}
      {!isActive && (
        <Card className="relative overflow-hidden border-none shadow-xl bg-primary text-primary-foreground">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-50" />

          <CardContent className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Olá, {firstName}! 👋
                  </h1>
                  <p className="text-primary-foreground/80 text-lg">
                    {isExpired
                      ? 'Seu período de teste acabou. Faça a assinatura para continuar!'
                      : 'Bom ver você novamente. Aproveite seu período de teste grátis.'}
                  </p>
                </div>

                <div className="max-w-md pt-2">
                  <div className="flex items-center justify-between text-sm mb-2 font-medium">
                    <span className="opacity-90">Tempo Restante de Teste</span>
                    <span>
                      {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} de {TRIAL_DURATION_DAYS}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${
                        isExpired
                          ? 'bg-red-400'
                          : isNearLimit
                            ? 'bg-yellow-400'
                            : 'bg-white'
                      }`}
                      style={{ width: `${trialPercentage}%` }}
                    />
                  </div>
                  {isNearLimit && !isExpired && (
                    <p className="text-xs text-yellow-200 mt-2 font-medium animate-pulse">
                      Atenção: Seu período de teste acaba em breve!
                    </p>
                  )}
                  {isExpired && (
                    <p className="text-xs text-red-200 mt-2 font-bold uppercase tracking-wider">
                      Teste Expirado - Assine para continuar criando orçamentos
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                <SubscriptionGuard showVisualDisabled={false}>
                  <Link href="/app/quotes/new">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold shadow-lg h-12 px-8"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Novo Orçamento
                    </Button>
                  </Link>
                </SubscriptionGuard>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold h-12 px-8 backdrop-blur-sm group"
                  >
                    <TrendingUp className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Assinar Plano Pro
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>

          {/* Decorative element */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mr-12 -mb-12">
            <FileText className="h-64 w-64 rotate-12" />
          </div>
        </Card>
      )}

      {/* Dashboard Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-slate-800">
              Desempenho e Métricas
            </h2>
            {isActive && (
              <p className="text-sm font-medium text-slate-500">
                Olá, {firstName}! Bem-vindo de volta ao seu painel.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SubscriptionGuard>
              <Link href="/app/quotes/new">
                <Button size="sm" className="font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo
                </Button>
              </Link>
            </SubscriptionGuard>
            <Link
              href="/app/quotes"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-slate-500 font-bold hover:text-primary',
              )}
            >
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuotesChart quotes={quotesData || []} />
          </div>
          <div className="lg:col-span-1">
            <StatusPieChart quotes={quotesData || []} />
          </div>
          <div className="lg:col-span-3">
            <RevenueBarChart quotes={quotesData || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
