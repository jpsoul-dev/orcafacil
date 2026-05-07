import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { FileText, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { QuotesChart } from './components/quotes-chart'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()

  const [{ data: quotesData }, { data: profile }] = await Promise.all(
    [
      supabase
        .from('quotes')
        .select('created_at')
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', user?.id || '')
        .single()
    ],
  )

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuário'
  const firstName = userName.split(' ')[0]

  // Regras de negócio de assinatura e trial
  const isActive = profile?.subscription_status === 'active'
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
  const timeRemaining = trialEndsAt.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)))
  
  // O usuário só está em trial se o status for trialing E ainda tiver dias
  const isTrialing = profile?.subscription_status === 'trialing' && daysRemaining > 0
  const isExpired = !isActive && !isTrialing
  
  const trialPercentage = Math.min(((15 - daysRemaining) / 15) * 100, 100)
  const isNearLimit = isTrialing && daysRemaining <= 3

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas / Upgrade (Só aparece para quem NÃO tem assinatura ativa) */}
      {!isActive && (
        <Card className="relative overflow-hidden border-none shadow-xl bg-primary text-primary-foreground">
          {/* Camada de Gradiente Sutil */}
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
                      {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} de 15
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
                <Link
                  href="/app/quotes/new"
                  className={isExpired ? 'pointer-events-none' : ''}
                >
                  <Button
                    disabled={isExpired}
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold shadow-lg h-12 px-8"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Novo Orçamento
                  </Button>
                </Link>
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

          {/* Elemento Decorativo */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mr-12 -mb-12">
            <FileText className="h-64 w-64 rotate-12" />
          </div>
        </Card>
      )}

      {/* Gráfico de Orçamentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Desempenho de Orçamentos
            </h2>
            {isActive && (
              <p className="text-sm text-muted-foreground">
                Olá, {firstName}! Bem-vindo de volta.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <Link href="/app/quotes/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo
                </Button>
              </Link>
            )}
            <Link
              href="/app/quotes"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-muted-foreground hover:text-primary',
              )}
            >
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <QuotesChart quotes={quotesData || []} />
      </div>
    </div>
  )
}
