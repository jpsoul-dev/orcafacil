import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.customer && session.subscription) {
          const { error } = await supabase.rpc('update_profile_subscription', {
            p_stripe_customer_id: session.customer as string,
            p_subscription_status: 'active',
            p_subscription_id: session.subscription as string,
          })
          
          if (error) throw error
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase.rpc('update_profile_subscription', {
          p_stripe_customer_id: subscription.customer as string,
          p_subscription_status: subscription.status,
          p_subscription_id: subscription.id,
        })
        
        if (error) throw error
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Error handling webhook event:', error.message)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
