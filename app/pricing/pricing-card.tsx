'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
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
      disabled={!isConfigured || pending}
      className="w-full h-11 rounded-md font-semibold gap-2 bg-primary hover:bg-primary-hover text-primary-foreground transition-all duration-ds-fast shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
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
        <h1 className="text-ds-heading-lg font-bold tracking-tight text-foreground">
          Escolha seu plano
        </h1>
        <p className="text-muted-foreground text-ds-body-sm font-medium leading-relaxed">
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
          <TabsList className="flex flex-nowrap h-auto bg-muted/50 p-1 rounded-md gap-1 border border-border/50 w-full">
            <TabsTrigger
              value="month"
              className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center justify-center gap-1.5 cursor-pointer flex-1"
            >
              Mensal
            </TabsTrigger>
            <TabsTrigger
              value="year"
              className="text-ds-body-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm px-3 py-1.5 rounded-sm transition-all duration-ds-fast shrink-0 flex items-center justify-center gap-1.5 cursor-pointer flex-1"
            >
              Anual
              {discountPercent > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-status-approved-bg text-status-approved-fg">
                  -{discountPercent}%
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Single Pro Plan Card */}
      <div className="bg-card border border-border rounded-md p-6 sm:p-8 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-ds-fast">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-ds-heading-xs font-bold tracking-tight text-foreground">
              {productName || 'Plano Pro'}
            </h3>
            <span className="text-ds-caption font-semibold px-2 py-0.5 rounded-sm bg-accent text-accent-foreground border border-accent-foreground/10">
              Mais Popular
            </span>
          </div>

          {/* Dynamic Price Display */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground transition-all duration-ds-fast">
              {activePriceAmount}
            </span>
            <span className="text-muted-foreground text-ds-body-sm font-medium">
              /{billingInterval === 'month' ? 'mês' : 'ano'}
            </span>
          </div>

          <div className="h-px bg-border my-6" />

          {/* Features List */}
          <ul className="space-y-3.5 mb-8">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" strokeWidth={2.5} />
                <span className="text-ds-body-sm font-medium text-foreground leading-tight">
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
