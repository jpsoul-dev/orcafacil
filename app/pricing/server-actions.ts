'use server'

import { createClient } from '../../lib/supabase/server'
import { stripe } from '../../lib/stripe'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'


export async function createCheckoutAction(formData?: FormData) {
  logger.info('createCheckoutAction called')
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    logger.error('User not found in createCheckoutAction', userError)
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, subscription_status')
    .eq('id', user.id)
    .single()

  let stripeCustomerId = profile?.stripe_customer_id

  // Lazy creation: if the Stripe customer is missing, create it now
  if (!stripeCustomerId) {
    logger.info(
      'Stripe customer missing, attempting lazy creation for user:',
      user.id,
    )
    const { setupNewUser } = await import('../../lib/services/user-service')
    const result = await setupNewUser(user.id, user.email!)

    if (!result.success) {
      logger.error('Failed to lazily create Stripe customer', result.error)
      throw new Error(
        result.error ||
          'Não foi possível configurar sua conta de pagamento. Tente novamente mais tarde.',
      )
    }

    stripeCustomerId = result.customerId
  }

  logger.info('Creating checkout session for customer:', stripeCustomerId)

  let sessionUrl: string | null = null

  // Extract the plan (monthly or yearly) sent by the form
  const selectedPlan = formData ? (formData.get('plan') as string | null) : null
  let priceId: string | undefined = undefined

  // Resolve pricing dynamically on server if a valid plan was selected
  const productId = process.env.STRIPE_PRODUCT_ID
  if (productId && (selectedPlan === 'monthly' || selectedPlan === 'yearly')) {
    try {
      logger.info(`Resolving price dynamically on server for plan: ${selectedPlan}`)
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      })

      const targetInterval = selectedPlan === 'yearly' ? 'year' : 'month'
      const matchedPrice = prices.data.find(
        (price) => price.recurring?.interval === targetInterval
      )

      if (matchedPrice) {
        priceId = matchedPrice.id
        logger.info(`Resolved priceId dynamically: ${priceId}`)
      } else {
        logger.warn(`No active price found for product ${productId} with interval ${targetInterval}`)
      }
    } catch (err) {
      logger.error('Failed to resolve Stripe price from product:', err)
    }
  }

  // Fallback: if not resolved dynamically, fallback to the default STRIPE_PRICE_ID
  if (!priceId) {
    logger.info('priceId not resolved dynamically, trying STRIPE_PRICE_ID env var')
    priceId = process.env.STRIPE_PRICE_ID
  }

  // If still no priceId, search the first active price for the configured product as secondary fallback
  if (!priceId) {
    logger.info('priceId still missing, searching Stripe fallback from product...')
    if (productId) {
      try {
        const prices = await stripe.prices.list({
          product: productId,
          active: true,
          limit: 1,
        })
        priceId = prices.data[0]?.id
      } catch (err) {
        logger.error('Failed to search fallback price', err)
      }
    } else {
      logger.error('STRIPE_PRODUCT_ID is missing in environment variables for fallback search')
    }
  }

  if (!priceId) {
    logger.error('No price ID resolved dynamically, via ENV or Stripe fallback')
    redirect('/pricing?error=configuration_missing')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    logger.info('Session created:', session.url)
    sessionUrl = session.url
  } catch (error) {
    logger.error('Error creating Stripe session:', error)
    throw error
  }

  if (sessionUrl) {
    redirect(sessionUrl)
  }
}

export async function createPortalAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let stripeCustomerId = profile?.stripe_customer_id

  if (!stripeCustomerId) {
    // Attempt lazy creation for the portal as well
    const { setupNewUser } = await import('../../lib/services/user-service')
    const result = await setupNewUser(user.id, user.email!)

    if (!result.success) {
      throw new Error(result.error || 'Perfil de pagamento não encontrado.')
    }

    stripeCustomerId = result.customerId
  }

  let portalUrl: string | null = null

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/app`,
    })
    portalUrl = session.url
  } catch (error) {
    logger.error('Error creating portal session:', error)
    throw error
  }

  if (portalUrl) {
    redirect(portalUrl)
  }
}

interface StripeSubscription {
  current_period_end?: number | null
  cancel_at?: number | null
  items?: {
    data: Array<{
      price?: {
        unit_amount?: number | null
        recurring?: {
          interval?: 'month' | 'year' | null
        } | null
      } | null
    }>
  } | null
}

export async function getActiveSubscriptionDetails() {
  logger.info('getActiveSubscriptionDetails called')
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    logger.error('User not authenticated in getActiveSubscriptionDetails', userError)
    return { error: 'Não autenticado' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_id, subscription_status, trial_ends_at, cancel_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    logger.error('Error fetching user profile in getActiveSubscriptionDetails', profileError)
    return { error: 'Perfil não encontrado' }
  }

  const status = profile.subscription_status
  const trialEndsAt = profile.trial_ends_at
  const cancelAt = profile.cancel_at

  // Caso 1: Usuário em período de testes (trialing)
  if (status === 'trialing') {
    return {
      planName: 'Avaliação Gratuita',
      price: 'R$ 0,00',
      status: 'trialing',
      trialEndsAt,
      cancelAt: null,
      nextBillingDate: trialEndsAt,
    }
  }

  // Caso 2: Sem assinatura ativa
  if (!profile.subscription_id || !['active', 'past_due', 'unpaid', 'paused'].includes(status || '')) {
    return {
      planName: null,
      price: null,
      status: status || 'none',
      trialEndsAt: null,
      cancelAt: null,
      nextBillingDate: null,
    }
  }

  // Caso 3: Assinatura ativa ou similar no Stripe
  try {
    const subscription = (await stripe.subscriptions.retrieve(
      profile.subscription_id
    )) as unknown as StripeSubscription
    
    const priceItem = subscription.items?.data?.[0]?.price
    const interval = priceItem?.recurring?.interval // 'month' ou 'year'
    const amount = priceItem?.unit_amount ? priceItem.unit_amount / 100 : 0
    
    const formattedPrice = amount > 0 
      ? amount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }) + (interval === 'year' ? '/ano' : '/mês')
      : 'R$ 39,90/mês'

    const isYearly = interval === 'year'
    const planName = isYearly ? 'Assinatura Pro Anual' : 'Assinatura Pro Mensal'

    // Determinar a data da próxima cobrança de forma defensiva
    const currentPeriodEnd = subscription.current_period_end
    const nextBillingDate = typeof currentPeriodEnd === 'number' && !isNaN(currentPeriodEnd) && currentPeriodEnd > 0
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null

    const cancelAtTimestamp = subscription.cancel_at
    const cancelAt = typeof cancelAtTimestamp === 'number' && !isNaN(cancelAtTimestamp) && cancelAtTimestamp > 0
      ? new Date(cancelAtTimestamp * 1000).toISOString()
      : null

    return {
      planName,
      price: formattedPrice,
      status,
      trialEndsAt: null,
      cancelAt,
      nextBillingDate,
    }
  } catch (error) {
    logger.error('Failed to retrieve Stripe subscription in getActiveSubscriptionDetails:', error)
    // Fallback caso ocorra algum erro de comunicação com o Stripe
    return {
      planName: 'Assinatura Pro',
      price: 'Sob Consulta',
      status,
      trialEndsAt: null,
      cancelAt: cancelAt,
      nextBillingDate: cancelAt || trialEndsAt,
      error: 'Erro de comunicação com o provedor de pagamentos'
    }
  }
}

