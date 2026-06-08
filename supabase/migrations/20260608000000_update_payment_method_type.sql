-- Migration: Alterar payment_method de text para text[] na tabela quotes e atualizar a RPC upsert_quote_with_items
-- Created: 2026-06-08
-- Path: supabase/migrations/20260608000000_update_payment_method_type.sql

-- 1. Remover a view antiga antes de alterar os tipos das tabelas
DROP VIEW IF EXISTS public.vw_quotes CASCADE;

-- 2. Alterar o tipo da coluna na tabela quotes
-- Fazemos a migração convertendo o valor de texto existente em um array contendo esse texto.
ALTER TABLE public.quotes 
  ALTER COLUMN payment_method TYPE text[] USING 
    CASE 
      WHEN payment_method IS NULL THEN NULL 
      ELSE ARRAY[payment_method] 
    END;

-- 3. Recriar a view vw_quotes com o novo tipo de coluna (que agora retorna text[] automaticamente)
CREATE VIEW public.vw_quotes WITH (security_invoker = true) AS
 SELECT q.id,
    q.user_id,
    q.customer_id,
    q.valid_until,
    q.subtotal,
    q.discount_type,
    q.discount_value,
    q.total,
    q.payment_method, -- Agora é do tipo text[]
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

-- 4. Recriar a RPC get_quote_details
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

-- 5. Remover a RPC upsert_quote_with_items antiga (para evitar conflito de assinaturas de tipos)
DROP FUNCTION IF EXISTS public.upsert_quote_with_items(uuid, uuid, text, text, numeric, numeric, date, text, numeric, text, jsonb, uuid);

-- 6. Criar a nova RPC upsert_quote_with_items aceitando o parâmetro p_payment_method como text[]
CREATE OR REPLACE FUNCTION public.upsert_quote_with_items(
  p_quote_id uuid,
  p_customer_id uuid,
  p_title text,
  p_status text,
  p_subtotal numeric,
  p_total numeric,
  p_valid_until date,
  p_discount_type text,
  p_discount_value numeric,
  p_notes text,
  p_items jsonb,
  p_user_id uuid,
  p_payment_method text[] -- Novo parâmetro text[]
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_quote_id UUID;
  v_item JSONB;
BEGIN
  -- 1. Upsert or Insert Quote
  IF p_quote_id IS NOT NULL THEN
    -- Check if user owns the quote
    IF NOT EXISTS (SELECT 1 FROM public.quotes WHERE id = p_quote_id AND user_id = p_user_id) THEN
      RAISE EXCEPTION 'Não autorizado';
    END IF;

    UPDATE public.quotes SET
      customer_id = p_customer_id,
      title = p_title,
      status = COALESCE(p_status, status),
      subtotal = p_subtotal,
      total = p_total,
      valid_until = p_valid_until,
      discount_type = p_discount_type,
      discount_value = p_discount_value,
      notes = p_notes,
      payment_method = p_payment_method -- Salva payment_method no UPDATE
    WHERE id = p_quote_id
    RETURNING id INTO v_quote_id;

    -- 2. Delete old items
    DELETE FROM public.quote_items WHERE quote_id = v_quote_id;
  ELSE
    INSERT INTO public.quotes (
      user_id,
      customer_id,
      title,
      status,
      subtotal,
      total,
      valid_until,
      discount_type,
      discount_value,
      notes,
      payment_method -- Salva payment_method no INSERT
    ) VALUES (
      p_user_id,
      p_customer_id,
      p_title,
      COALESCE(p_status, 'draft'),
      p_subtotal,
      p_total,
      p_valid_until,
      p_discount_type,
      p_discount_value,
      p_notes,
      p_payment_method
    )
    RETURNING id INTO v_quote_id;
  END IF;

  -- 3. Insert new items
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      INSERT INTO public.quote_items (
        quote_id,
        catalog_item_id,
        item_name,
        quantity,
        unit_price,
        subtotal,
        unit_measure
      ) VALUES (
        v_quote_id,
        CASE WHEN (v_item->>'catalog_item_id') IS NOT NULL AND (v_item->>'catalog_item_id') <> '' THEN (v_item->>'catalog_item_id')::UUID ELSE NULL END,
        v_item->>'item_name',
        (v_item->>'quantity')::NUMERIC,
        (v_item->>'unit_price')::NUMERIC,
        (v_item->>'subtotal')::NUMERIC,
        v_item->>'unit_measure'
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'id', v_quote_id
  );
END;
$function$;
