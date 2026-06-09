-- Migration: Adicionar campo cnpj à tabela companies e atualizar RPC get_quote_details
-- Created: 2026-06-09
-- Path: supabase/migrations/20260609000000_add_cnpj_to_companies.sql

-- 1. Adicionar coluna cnpj
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cnpj text;

-- 2. Atualizar a empresa de testes padrão para ter o CNPJ correspondente ao modelo
UPDATE public.companies 
SET cnpj = '55.343.676/0001-70' 
WHERE name = 'Ferra Norte Ferragista' AND cnpj IS NULL;

-- 3. Recriar a RPC get_quote_details retornando cnpj no objeto company
CREATE OR REPLACE FUNCTION public.get_quote_details(p_quote_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSONB;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_quote_details(p_quote_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    result JSONB;
END;
$function$;

-- Apenas para limpar a assinatura se necessário. Mas redefinindo com o mesmo tipo de retorno e argumentos, podemos usar CREATE OR REPLACE.
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
            'payment_method', q.payment_method, -- Será serializado como um array JSON de strings
            'notes', q.notes,
            'created_at', q.created_at,
            'cancellation_reason', q.cancellation_reason,
            'company', (
                SELECT jsonb_build_object(
                    'name', c.name,
                    'phone', c.phone,
                    'logo_url', c.logo_url,
                    'cnpj', c.cnpj, -- Adicionado cnpj
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
