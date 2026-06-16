-- Migration to fix the 'Function Search Path Mutable' warnings (Security Advisor)
-- This migration sets search_path = '' for all SECURITY DEFINER functions in the public schema.
-- Reference: https://supabase.com/docs/guides/database/hardening#secure-your-database-functions

-- 1. close_account
ALTER FUNCTION public.close_account() SET search_path = '';

-- 2. get_quote_details
ALTER FUNCTION public.get_quote_details(uuid) SET search_path = '';

-- 3. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- 4. update_profile_subscription (Signature 1)
ALTER FUNCTION public.update_profile_subscription(text, text, text) SET search_path = '';

-- 5. update_profile_subscription (Signature 2)
ALTER FUNCTION public.update_profile_subscription(text, text, text, boolean) SET search_path = '';

-- 6. update_profile_subscription (Signature 3)
ALTER FUNCTION public.update_profile_subscription(text, text, text, boolean, timestamp with time zone) SET search_path = '';

-- 7. upsert_quote_with_items
ALTER FUNCTION public.upsert_quote_with_items(uuid, uuid, text, text, numeric, numeric, date, text, numeric, text, jsonb, uuid, text[], boolean) SET search_path = '';

-- 8. upsert_receipt_with_items
ALTER FUNCTION public.upsert_receipt_with_items(uuid, uuid, text, numeric, text, text, date, jsonb, uuid) SET search_path = '';
