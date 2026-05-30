'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { createCheckoutAction } from './server-actions'

interface PricingPlansCardProps {
  productName: string
  productDescription: string
  monthlyPriceId: string | null
  monthlyPriceAmount: string
  yearlyPriceId: string | null
  yearlyPriceAmount: string
  discountPercent: number
  isConfigured: boolean
  features: string[]
}

function SubmitButton({
  isConfigured,
  billingInterval,
}: {
  isConfigured: boolean
  billingInterval: 'month' | 'year'
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="lg"
      disabled={!isConfigured || pending}
      className="w-full text-sm sm:text-base font-bold h-12 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : isConfigured ? (
        billingInterval === 'month' ? 'Assinar Mensal' : 'Assinar Anual'
      ) : (
        'Indisponível'
      )}
    </Button>
  )
}

export function PricingPlansCard({
  productName,
  productDescription,
  monthlyPriceId,
  monthlyPriceAmount,
  yearlyPriceId,
  yearlyPriceAmount,
  discountPercent,
  isConfigured,
  features,
}: PricingPlansCardProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')

  const activePriceId = billingInterval === 'month' ? monthlyPriceId : yearlyPriceId
  const activePriceAmount = billingInterval === 'month' ? monthlyPriceAmount : yearlyPriceAmount

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Minimalist header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
          Escolha seu plano
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {productDescription || 'Experimente grátis por 15 dias. Cancele quando quiser.'}
        </p>
      </div>

      {/* Minimalist billing interval selector using shadcn/ui Tabs */}
      <div className="flex justify-center">
        <Tabs
          value={billingInterval}
          onValueChange={(value) => setBillingInterval(value as 'month' | 'year')}
          className="w-full max-w-[280px]"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="month" className="text-xs sm:text-sm font-medium py-1.5">
              Mensal
            </TabsTrigger>
            <TabsTrigger value="year" className="text-xs sm:text-sm font-medium py-1.5 flex items-center justify-center gap-1.5">
              Anual
              {discountPercent > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                  -{discountPercent}%
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Single Pro Plan Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {productName || 'Plano Pro'}
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              Mais Popular
            </span>
          </div>

          {/* Dynamic Price Display */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground transition-all duration-300">
              {activePriceAmount}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              /{billingInterval === 'month' ? 'mês' : 'ano'}
            </span>
          </div>

          <div className="h-px bg-border my-6" />

          {/* Features List */}
          <ul className="space-y-3.5 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium text-foreground/90 leading-tight">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Subscription Form */}
        <form action={createCheckoutAction} className="space-y-3">
          <input type="hidden" name="priceId" value={activePriceId || ''} />

          <SubmitButton isConfigured={isConfigured} billingInterval={billingInterval} />

          {!isConfigured && (
            <p className="text-[11px] text-center text-destructive leading-normal font-medium mt-2">
              O sistema de pagamentos está em manutenção. Por favor, tente mais tarde.
            </p>
          )}

          {isConfigured && (
            <p className="text-[10px] text-center text-muted-foreground leading-normal mt-2">
              Cobrança segura processada pelo Stripe. Cancele com um clique.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
