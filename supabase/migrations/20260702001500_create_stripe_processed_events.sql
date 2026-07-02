-- Create table for tracking processed Stripe events to ensure idempotency.
CREATE TABLE IF NOT EXISTS public.stripe_processed_events (
  id TEXT PRIMARY KEY,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (No policies needed, accessed only via service_role bypass by the webhook handler)
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;
