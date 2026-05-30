import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

interface ReconciliationResult {
  shouldRedirect: boolean
}

/**
 * Reconciles a Stripe Checkout session with the Supabase profile.
 * Used as a "double validation" when the user is redirected back
 * from Stripe Checkout with a session_id in the URL.
 *
 * If the profile is already active, skip the Stripe API call.
 * Otherwise, verify the session and update the subscription status.
 */
export async function reconcileStripeCheckout(
  sessionId: string,
  currentSubscriptionStatus: string | null,
): Promise<ReconciliationResult> {
  if (currentSubscriptionStatus === 'active') {
    return { shouldRedirect: true }
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const isPaid = session.payment_status === 'paid' || session.status === 'complete'

    if (!isPaid) {
      return { shouldRedirect: false }
    }

    const { error: updateError } = await supabaseAdmin.rpc('update_profile_subscription', {
      p_stripe_customer_id: session.customer as string,
      p_subscription_status: 'active',
      p_subscription_id: session.subscription as string,
      p_cancel_at_period_end: false,
      p_cancel_at: null,
    })

    if (updateError) {
      logger.error('Failed to update database via RPC during double validation:', updateError)
      return { shouldRedirect: false }
    }

    return { shouldRedirect: true }
  } catch (err) {
    logger.error('Error during Stripe Checkout double validation:', err)
    return { shouldRedirect: false }
  }
}
