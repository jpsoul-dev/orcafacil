import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'


export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()
  const signature = headerPayload.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    )
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Webhook signature verification failed:', errorMessage)
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 },
    )
  }



  // Enum de status permitidos pelo Stripe que nossa aplicação suporta
  const subscriptionStatusSchema = z.enum([
    'active',
    'trialing',
    'past_due',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired',
    'paused',
  ])

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.customer && session.subscription) {
          const { error } = await supabaseAdmin.rpc('update_profile_subscription', {
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
        const statusValidation = subscriptionStatusSchema.safeParse(
          subscription.status,
        )

        if (!statusValidation.success) {
          logger.error(
            `Invalid subscription status received: ${subscription.status}`,
          )
          return NextResponse.json(
            { error: 'Invalid subscription status' },
            { status: 400 },
          )
        }

        const { error } = await supabaseAdmin.rpc('update_profile_subscription', {
          p_stripe_customer_id: subscription.customer as string,
          p_subscription_status: statusValidation.data,
          p_subscription_id: subscription.id,
        })

        if (error) throw error
        break
      }


      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription

        // TODO: Implemente o envio de e-mail (Resend, Nodemailer, etc.)
        // await sendTrialEndingEmail(subscription.customer as string)
        logger.info(`Trial will end soon for customer ${subscription.customer}`)
        break
      }

      default:
        logger.info(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error handling webhook event:', errorMessage)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}
