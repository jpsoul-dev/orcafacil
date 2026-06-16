-- Migration to address remaining Security Advisor warnings
-- 1. Fixes 'Function Search Path Mutable' on normal (SECURITY INVOKER) functions.
-- 2. Fixes 'Public Can Execute SECURITY DEFINER Functions' by revoking public/anonymous execution rights on critical functions.

---------------------------------------------------------
-- PART 1: Set search_path on remaining normal functions
---------------------------------------------------------

ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.prevent_quote_deletion() SET search_path = '';
ALTER FUNCTION public.prevent_quote_modification() SET search_path = '';
ALTER FUNCTION public.set_next_quote_number() SET search_path = '';
ALTER FUNCTION public.simple_hashid(bigint) SET search_path = '';


---------------------------------------------------------
-- PART 2: Revoke EXECUTE from PUBLIC/anon on SECURITY DEFINER functions
---------------------------------------------------------

-- 2.1 close_account: Only authenticated users and service_role should execute
REVOKE EXECUTE ON FUNCTION public.close_account() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.close_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.close_account() TO authenticated, service_role;

-- 2.2 get_quote_details: Only authenticated users and service_role should execute
REVOKE EXECUTE ON FUNCTION public.get_quote_details(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_quote_details(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_quote_details(uuid) TO authenticated, service_role;

-- 2.3 handle_new_user: Only triggered by database internally. No direct client execution needed.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 2.4 update_profile_subscription (Signature 1): Only service_role (Stripe Webhook) should execute
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text) TO service_role;

-- 2.5 update_profile_subscription (Signature 2): Only service_role (Stripe Webhook) should execute
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean) TO service_role;

-- 2.6 update_profile_subscription (Signature 3): Only service_role (Stripe Webhook) should execute
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean, timestamp with time zone) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean, timestamp with time zone) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean, timestamp with time zone) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_subscription(text, text, text, boolean, timestamp with time zone) TO service_role;

-- 2.7 upsert_quote_with_items: Only authenticated users and service_role should execute
REVOKE EXECUTE ON FUNCTION public.upsert_quote_with_items(uuid, uuid, text, text, numeric, numeric, date, text, numeric, text, jsonb, uuid, text[], boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_quote_with_items(uuid, uuid, text, text, numeric, numeric, date, text, numeric, text, jsonb, uuid, text[], boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_quote_with_items(uuid, uuid, text, text, numeric, numeric, date, text, numeric, text, jsonb, uuid, text[], boolean) TO authenticated, service_role;

-- 2.8 upsert_receipt_with_items: Only authenticated users and service_role should execute
REVOKE EXECUTE ON FUNCTION public.upsert_receipt_with_items(uuid, uuid, text, numeric, text, text, date, jsonb, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_receipt_with_items(uuid, uuid, text, numeric, text, text, date, jsonb, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_receipt_with_items(uuid, uuid, text, numeric, text, text, date, jsonb, uuid) TO authenticated, service_role;
