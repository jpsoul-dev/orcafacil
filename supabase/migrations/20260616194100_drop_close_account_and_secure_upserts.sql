-- Migration to drop obsolete function and secure upsert functions
-- 1. Drops close_account() function since user account deletion features were removed.
-- 2. Secures upsert_quote_with_items and upsert_receipt_with_items to prevent user impersonation.

-- Drop obsolete function
DROP FUNCTION IF EXISTS public.close_account();

-- Recreate secured upsert_quote_with_items function
CREATE OR REPLACE FUNCTION "public"."upsert_quote_with_items"("p_quote_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_status" "text", "p_subtotal" numeric, "p_total" numeric, "p_valid_until" "date", "p_discount_type" "text", "p_discount_value" numeric, "p_notes" "text", "p_items" "jsonb", "p_user_id" "uuid", "p_payment_method" "text"[], "p_show_quote_number" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = ''
    AS $$
DECLARE
  v_quote_id UUID;
  v_item JSONB;
BEGIN
  -- SECURITY CHECK: Validate that the authenticated user is only acting on their own data
  IF auth.role() = 'authenticated' AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Não autorizado: o ID do usuário não corresponde ao usuário autenticado.';
  ELSIF auth.role() = 'anon' THEN
    RAISE EXCEPTION 'Não autorizado';
  END IF;

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
      payment_method = p_payment_method,
      show_quote_number = p_show_quote_number
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
      payment_method,
      show_quote_number
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
      p_payment_method,
      p_show_quote_number
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
        unit_measure,
        discount_type,
        discount_value
      ) VALUES (
        v_quote_id,
        CASE WHEN (v_item->>'catalog_item_id') IS NOT NULL AND (v_item->>'catalog_item_id') <> '' THEN (v_item->>'catalog_item_id')::UUID ELSE NULL END,
        v_item->>'item_name',
        (v_item->>'quantity')::NUMERIC,
        (v_item->>'unit_price')::NUMERIC,
        (v_item->>'subtotal')::NUMERIC,
        v_item->>'unit_measure',
        COALESCE(v_item->>'discount_type', 'none'),
        COALESCE((v_item->>'discount_value')::NUMERIC, 0)
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'id', v_quote_id
  );
END;
$$;


-- Recreate secured upsert_receipt_with_items function
CREATE OR REPLACE FUNCTION "public"."upsert_receipt_with_items"("p_receipt_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_amount" numeric, "p_payment_method" "text", "p_services_description" "text", "p_issued_at" "date", "p_items" "jsonb", "p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET search_path = ''
    AS $$
DECLARE
  v_receipt_id UUID;
  v_item JSONB;
  v_count INT;
  v_receipt_number TEXT;
BEGIN
  -- SECURITY CHECK: Validate that the authenticated user is only acting on their own data
  IF auth.role() = 'authenticated' AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Não autorizado: o ID do usuário não corresponde ao usuário autenticado.';
  ELSIF auth.role() = 'anon' THEN
    RAISE EXCEPTION 'Não autorizado';
  END IF;

  -- 1. Inserir ou Atualizar o Recibo
  IF p_receipt_id IS NOT NULL THEN
    -- Valida se o recibo pertence ao usuário
    IF NOT EXISTS (SELECT 1 FROM public.quote_receipts WHERE id = p_receipt_id AND user_id = p_user_id) THEN
      RAISE EXCEPTION 'Não autorizado';
    END IF;

    UPDATE public.quote_receipts SET
      customer_id = p_customer_id,
      title = p_title,
      amount = p_amount,
      payment_method = p_payment_method,
      services_description = p_services_description,
      issued_at = p_issued_at
    WHERE id = p_receipt_id
    RETURNING id INTO v_receipt_id;

    -- Limpa os itens antigos para reinserção
    DELETE FROM public.receipt_items WHERE receipt_id = v_receipt_id;
  ELSE
    -- Gerar número sequencial único global de recibo para o usuário (ex: REC-001)
    SELECT COUNT(*) INTO v_count FROM public.quote_receipts WHERE user_id = p_user_id;
    v_receipt_number := 'REC-' || LPAD((v_count + 1)::TEXT, 3, '0');

    INSERT INTO public.quote_receipts (
      user_id,
      customer_id,
      quote_id,
      receipt_number,
      title,
      amount,
      payment_method,
      services_description,
      issued_at
    ) VALUES (
      p_user_id,
      p_customer_id,
      NULL, -- Sem vínculo com orçamento
      v_receipt_number,
      p_title,
      p_amount,
      p_payment_method,
      p_services_description,
      p_issued_at
    )
    RETURNING id INTO v_receipt_id;
  END IF;

  -- 2. Inserir novos itens do recibo avulso
  IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      INSERT INTO public.receipt_items (
        receipt_id,
        item_name,
        quantity,
        unit_price,
        subtotal
      ) VALUES (
        v_receipt_id,
        v_item->>'item_name',
        (v_item->>'quantity')::NUMERIC,
        (v_item->>'unit_price')::NUMERIC,
        (v_item->>'subtotal')::NUMERIC
      );
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'id', v_receipt_id
  );
END;
$$;
