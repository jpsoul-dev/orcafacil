-- Migration: Mover show_quote_number para a tabela companies e ler globalmente na RPC get_quote_details
-- Created: 2026-06-10
-- Path: supabase/migrations/20260610150000_move_show_quote_number_to_companies.sql

-- 1. Adicionar show_quote_number na tabela companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS show_quote_number boolean DEFAULT true;

-- 2. Atualizar a RPC get_quote_details para carregar o show_quote_number da empresa do usuário
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
            -- Retorna o valor configurado na empresa do usuário emissor, com fallback para true
            'show_quote_number', COALESCE((
                SELECT c.show_quote_number 
                FROM public.companies c 
                WHERE c.user_id = q.user_id 
                LIMIT 1
            ), true),
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
                    'whatsapp', c.whatsapp,
                    'email', c.email,
                    'logo_url', c.logo_url,
                    'cnpj', c.cnpj,
                    'address_street', c.address_street,
                    'address_number', c.address_number,
                    'address_neighborhood', c.address_neighborhood,
                    'address_city', c.address_city,
                    'address_state', c.address_state,
                    'address_zip', c.address_zip,
                    'address_complement', c.address_complement,
                    'show_quote_number', c.show_quote_number
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
                        'unit_measure', COALESCE(qi.unit_measure, 'un'),
                        'discount_type', COALESCE(qi.discount_type, 'none'),
                        'discount_value', COALESCE(qi.discount_value, 0)
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
