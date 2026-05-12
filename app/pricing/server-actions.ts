'use server'

import { createClient } from '../../lib/supabase/server'
import { stripe } from '../../lib/stripe'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logger'

export async function createCheckoutAction() {
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

  // AUTO-CORREÇÃO: Se não tiver o ID do Stripe, tenta criar agora (Lazy Creation)
  if (!stripeCustomerId) {
    logger.info(
      'Stripe customer missing, attempting lazy creation for user:',
      user.id,
    )
    const { setupNewUser } = await import('../../lib/services/user-service')
    const result = await setupNewUser(user.id, user.email!)

    if (result.error || !result.customerId) {
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

  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1TU8m5PcWUVwpJOwXrI8ilBt',
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing`,
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
    // Tenta auto-correção também no portal
    const { setupNewUser } = await import('../../lib/services/user-service')
    const result = await setupNewUser(user.id, user.email!)

    if (result.error || !result.customerId) {
      throw new Error('Perfil de pagamento não encontrado.')
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
