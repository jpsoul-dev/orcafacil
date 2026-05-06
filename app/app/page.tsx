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

  const now = new Date()
  const firstDayOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString()

  const [{ count: monthQuotesCount }, { data: quotesData }] = await Promise.all(
    [
      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth),
      supabase
        .from('quotes')
        .select('created_at')
        .order('created_at', { ascending: true }),
    ],
  )

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Usuário'
  const firstName = userName.split(' ')[0]
  const quotesLimit = 5
  const currentCount = monthQuotesCount ?? 0
  const usagePercentage = Math.min((currentCount / quotesLimit) * 100, 100)
  const isNearLimit = currentCount >= 4
  const isOverLimit = currentCount >= quotesLimit

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas / Upgrade */}
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
                  {isOverLimit
                    ? 'Você atingiu o limite mensal. Faça o upgrade agora!'
                    : 'Bom ver você novamente. Veja como está seu progresso.'}
                </p>
              </div>

              <div className="max-w-md pt-2">
                <div className="flex items-center justify-between text-sm mb-2 font-medium">
                  <span className="opacity-90">Uso de Orçamentos (Mensal)</span>
                  <span>
                    {currentCount} / {quotesLimit}
                  </span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className={`h-full transition-all duration-700 ease-out rounded-full ${
                      isOverLimit
                        ? 'bg-red-400'
                        : isNearLimit
                          ? 'bg-yellow-400'
                          : 'bg-white'
                    }`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                {isNearLimit && !isOverLimit && (
                  <p className="text-xs text-yellow-200 mt-2 font-medium animate-pulse">
                    Atenção: Você está chegando ao limite do seu plano gratuito!
                  </p>
                )}
                {isOverLimit && (
                  <p className="text-xs text-red-200 mt-2 font-bold uppercase tracking-wider">
                    Limite Atingido - Libere acesso ilimitado abaixo
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/app/quotes/new"
                className={isOverLimit ? 'pointer-events-none' : ''}
              >
                <Button
                  disabled={isOverLimit}
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold shadow-lg h-12 px-8"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Orçamento
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold h-12 px-8 backdrop-blur-sm group"
              >
                <TrendingUp className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Upgrade para orçamentos ilimitados
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Elemento Decorativo */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mr-12 -mb-12">
          <FileText className="h-64 w-64 rotate-12" />
        </div>
      </Card>

      {/* Gráfico de Orçamentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Desempenho de Orçamentos
          </h2>
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
        <QuotesChart quotes={quotesData || []} />
      </div>
    </div>
  )
}
