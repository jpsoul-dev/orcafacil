'use server'

import { createClient } from '../../lib/supabase/server'
import { stripe } from '../../lib/stripe'
import { redirect } from 'next/navigation'

export async function createCheckoutAction() {
  console.log("createCheckoutAction called")
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("User not found in createCheckoutAction", userError)
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.stripe_customer_id) {
    console.error("Profile or Stripe customer not found", profileError)
    throw new Error('Stripe customer not found')
  }

  console.log("Creating checkout session for customer:", profile.stripe_customer_id)

  let sessionUrl: string | null = null

  try {
    const session = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
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

    console.log("Session created:", session.url)
    sessionUrl = session.url
  } catch (error) {
    console.error("Error creating Stripe session:", error)
    throw error
  }

  if (sessionUrl) {
    redirect(sessionUrl)
  }
}

export async function createPortalAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    throw new Error('Customer not found')
  }

  let portalUrl: string | null = null

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/app`,
    })
    portalUrl = session.url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }

  if (portalUrl) {
    redirect(portalUrl)
  }
}
