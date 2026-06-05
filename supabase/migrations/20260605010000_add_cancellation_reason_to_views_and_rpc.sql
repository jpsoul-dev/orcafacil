-- Migration: Adiciona cancellation_reason na view vw_quotes e na RPC get_quote_details
-- Created: 2026-06-05

-- 1. Remove a view antiga em cascata (isso também removerá a RPC get_quote_details que depende dela)
DROP VIEW IF EXISTS public.vw_quotes CASCADE;

-- 2. Recria a view vw_quotes incluindo cancellation_reason e mantendo as regras de segurança
CREATE VIEW public.vw_quotes WITH (security_invoker = true) AS
 SELECT q.id,
    q.user_id,
    q.customer_id,
    q.valid_until,
    q.subtotal,
    q.discount_type,
    q.discount_value,
    q.total,
    q.payment_method,
    q.notes,
    q.created_at,
        CASE
            WHEN q.valid_until < CURRENT_DATE AND q.status = 'pending'::text THEN 'expired'::text
            ELSE q.status
        END AS status,
    q.status AS original_status,
    q.title,
    q.quote_number,
    q.cancellation_reason
   FROM public.quotes q;

-- 3. Recria a RPC get_quote_details incluindo cancellation_reason no retorno JSONB
CREATE OR REPLACE FUNCTION public.get_quote_details(p_quote_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'id', q.id,
            'quote_number', q.quote_number,
            'title', q.title,
            'status', q.status,
            'valid_until', q.valid_until,
            'subtotal', q.subtotal,
            'discount_type', q.discount_type,
            'discount_value', q.discount_value,
            'total', q.total,
            'payment_method', q.payment_method,
            'notes', q.notes,
            'created_at', q.created_at,
            'cancellation_reason', q.cancellation_reason,
            'company', (
                SELECT jsonb_build_object(
                    'name', c.name,
                    'phone', c.phone,
                    'logo_url', c.logo_url,
                    'address_street', c.address_street,
                    'address_number', c.address_number,
                    'address_neighborhood', c.address_neighborhood,
                    'address_city', c.address_city,
                    'address_state', c.address_state,
                    'address_zip', c.address_zip,
                    'address_complement', c.address_complement
                )
                FROM public.companies c
                WHERE c.user_id = q.user_id
                LIMIT 1
            ),
            'customer', (
                SELECT jsonb_build_object(
                    'name', cust.name,
                    'document', cust.document,
                    'phone', cust.phone,
                    'whatsapp', cust.whatsapp,
                    'email', cust.email,
                    'address_street', cust.address_street,
                    'address_number', cust.address_number,
                    'address_neighborhood', cust.address_neighborhood,
                    'address_city', cust.address_city,
                    'address_state', cust.address_state,
                    'address_zip', cust.address_zip
                )
                FROM public.customers cust
                WHERE cust.id = q.customer_id
            ),
            'items', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'item_name', qi.item_name,
                        'quantity', qi.quantity,
                        'unit_price', qi.unit_price,
                        'subtotal', qi.subtotal,
                        'unit_measure', COALESCE(qi.unit_measure, 'un')
                    )
                )
                FROM public.quote_items qi
                WHERE qi.quote_id = q.id
            )
        ) INTO result
    FROM public.vw_quotes q
    WHERE q.id = p_quote_id AND q.user_id = auth.uid();

    RETURN result;
END;
$function$;
