import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PricingPlansCard } from './pricing-card'
import { logger } from '@/lib/logger'

const PLAN_FEATURES = [
  'Orçamentos ilimitados',
  'Catálogo inteligente',
  'Recibos',
  'Ordens de serviço',
]

export default async function PricingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const productId = process.env.STRIPE_PRODUCT_ID

  let product = null
  let monthlyPrice = null
  let yearlyPrice = null
  let discountPercent = 0

  if (productId) {
    try {
      // Fetch the specific product from Stripe
      logger.info(`Fetching product from Stripe: ${productId}`)
      product = await stripe.products.retrieve(productId)

      if (product && product.active) {
        // Fetch all active prices for this product
        logger.info(`Fetching prices for product: ${productId}`)
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
        })

        // Filter monthly and yearly prices
        monthlyPrice = prices.data.find((price) => price.recurring?.interval === 'month') || null
        yearlyPrice = prices.data.find((price) => price.recurring?.interval === 'year') || null

        // Calculate annual discount dynamically
        if (monthlyPrice?.unit_amount && yearlyPrice?.unit_amount) {
          const fullYearCost = monthlyPrice.unit_amount * 12
          const discountedCost = yearlyPrice.unit_amount
          discountPercent = Math.round(((fullYearCost - discountedCost) / fullYearCost) * 100)
        }
      }
    } catch (error) {
      logger.error('Failed to fetch Stripe data in PricingPage:', error)
    }
  } else {
    logger.error('STRIPE_PRODUCT_ID is missing in environment variables')
  }

  // Check if the payment system is configured (needs at least one active price or the env fallback)
  const hasStripePrice = !!(monthlyPrice?.id || yearlyPrice?.id)
  const isConfigured = hasStripePrice || !!process.env.STRIPE_PRICE_ID

  const productName = product?.name || 'Plano Pro'
  const productDescription =
    product?.description ||
    'Assine agora para continuar criando orçamentos profissionais.'

  // Format prices in BRL
  const monthlyPriceAmount = monthlyPrice?.unit_amount
    ? (monthlyPrice.unit_amount / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : 'R$ 39,90'

  const yearlyPriceAmount = yearlyPrice?.unit_amount
    ? (yearlyPrice.unit_amount / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : 'R$ 399,00'

  // Map price IDs to pass to the form
  const monthlyPriceId = monthlyPrice?.id || process.env.STRIPE_PRICE_ID || null
  const yearlyPriceId = yearlyPrice?.id || null

  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4 py-12 sm:py-24">
      <PricingPlansCard
        productName={productName}
        productDescription={productDescription}
        monthlyPriceId={monthlyPriceId}
        monthlyPriceAmount={monthlyPriceAmount}
        yearlyPriceId={yearlyPriceId}
        yearlyPriceAmount={yearlyPriceAmount}
        discountPercent={discountPercent}
        isConfigured={isConfigured}
        features={PLAN_FEATURES}
      />
    </div>
  )
}
