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

  // Extract the priceId sent by the form, with safe fallbacks
  const selectedPriceId = formData ? (formData.get('priceId') as string | null) : null
  let priceId = selectedPriceId || process.env.STRIPE_PRICE_ID

  // Fallback: if not in FormData nor ENV, search the first active price for the configured product
  if (!priceId) {
    logger.info('priceId missing in FormData and ENV, searching Stripe fallback...')
    const productId = process.env.STRIPE_PRODUCT_ID
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
    logger.error('No price ID found in FormData, ENV or Stripe fallback')
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
