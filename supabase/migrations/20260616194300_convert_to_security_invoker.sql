-- Migration to resolve 'Signed-In Users Can Execute SECURITY DEFINER Function' warnings
-- Converts public.get_quote_details, public.upsert_quote_with_items, and public.upsert_receipt_with_items
-- from SECURITY DEFINER to SECURITY INVOKER.
-- Since the application's RLS policies allow authenticated users full access to their own data,
-- these functions can safely execute with the caller's privileges (SECURITY INVOKER) without breaking functionality.

-- 1. get_quote_details
ALTER FUNCTION public.get_quote_details(uuid) SECURITY INVOKER;

-- 2. upsert_quote_with_items
ALTER FUNCTION public.upsert_quote_with_items(uuid, uuid, text, text, numeric, numeric, date, text, numeric, text, jsonb, uuid, text[], boolean) SECURITY INVOKER;

-- 3. upsert_receipt_with_items
ALTER FUNCTION public.upsert_receipt_with_items(uuid, uuid, text, numeric, text, text, date, jsonb, uuid) SECURITY INVOKER;
