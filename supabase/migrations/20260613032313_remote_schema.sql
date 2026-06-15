


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."close_account"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;
    DELETE FROM public.companies WHERE user_id = v_user_id;
    DELETE FROM public.profiles WHERE id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;


ALTER FUNCTION "public"."close_account"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_quote_details"("p_quote_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'id', q.id,
            'quote_number', q.quote_number,
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
$$;


ALTER FUNCTION "public"."get_quote_details"("p_quote_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, subscription_status, trial_ends_at)
  values (new.id, 'trialing', (now() + interval '15 days'));
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_quote_deletion"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Permite a exclusão física unicamente para orçamentos na situação 'draft'
  IF OLD.status IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'Apenas orçamentos na situação "Rascunho" (draft) podem ser excluídos fisicamente.';
  END IF;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."prevent_quote_deletion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_quote_modification"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Permite a transição de aprovado para finalizado ou cancelado
  IF OLD.status = 'approved' AND NEW.status IN ('completed', 'cancelled') THEN
    RETURN NEW;
  END IF;

  -- Permite a reabertura de orçamentos rejeitados ou cancelados para pendente
  IF OLD.status IN ('rejected', 'cancelled') AND NEW.status = 'pending' THEN
    RETURN NEW;
  END IF;

  -- Impede qualquer modificação em orçamentos fechados ou ativos avançados
  IF OLD.status IN ('approved', 'rejected', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Orçamento com status "%" não pode ser editado.', OLD.status;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_quote_modification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_next_quote_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := COALESCE(
      (SELECT max(quote_number) FROM public.quotes WHERE user_id = NEW.user_id),
      0
    ) + 1;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_next_quote_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."simple_hashid"("val" bigint) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  alphabet text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  res text := '';
  rem bigint;
BEGIN
  IF val = 0 THEN RETURN substr(alphabet, 1, 1); END IF;
  WHILE val > 0 LOOP
    rem := val % 62;
    res := substr(alphabet, rem::int + 1, 1) || res;
    val := val / 62;
  END LOOP;
  RETURN LPAD(res, 6, 'k'); -- Usando 'k' como padding
END;
$$;


ALTER FUNCTION "public"."simple_hashid"("val" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_status = p_subscription_status,
    subscription_id = p_subscription_id
  WHERE stripe_customer_id = p_stripe_customer_id;
END;
$$;


ALTER FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_status = p_subscription_status,
    subscription_id = p_subscription_id,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = timezone('utc'::text, now())
  WHERE stripe_customer_id = p_stripe_customer_id;
END;
$$;


ALTER FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean DEFAULT false, "p_cancel_at" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.profiles
  SET 
    subscription_status = p_subscription_status,
    subscription_id = p_subscription_id,
    cancel_at_period_end = p_cancel_at_period_end,
    cancel_at = p_cancel_at,
    updated_at = timezone('utc'::text, now())
  WHERE stripe_customer_id = p_stripe_customer_id;
END;
$$;


ALTER FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean, "p_cancel_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_quote_with_items"("p_quote_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_status" "text", "p_subtotal" numeric, "p_total" numeric, "p_valid_until" "date", "p_discount_type" "text", "p_discount_value" numeric, "p_notes" "text", "p_items" "jsonb", "p_user_id" "uuid", "p_payment_method" "text"[], "p_show_quote_number" boolean DEFAULT true) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."upsert_quote_with_items"("p_quote_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_status" "text", "p_subtotal" numeric, "p_total" numeric, "p_valid_until" "date", "p_discount_type" "text", "p_discount_value" numeric, "p_notes" "text", "p_items" "jsonb", "p_user_id" "uuid", "p_payment_method" "text"[], "p_show_quote_number" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_receipt_with_items"("p_receipt_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_amount" numeric, "p_payment_method" "text", "p_services_description" "text", "p_issued_at" "date", "p_items" "jsonb", "p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_receipt_id UUID;
  v_item JSONB;
  v_count INT;
  v_receipt_number TEXT;
BEGIN
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


ALTER FUNCTION "public"."upsert_receipt_with_items"("p_receipt_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_amount" numeric, "p_payment_method" "text", "p_services_description" "text", "p_issued_at" "date", "p_items" "jsonb", "p_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."catalog_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "unit_measure" "text" DEFAULT 'un'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "catalog_items_type_check" CHECK (("type" = ANY (ARRAY['product'::"text", 'service'::"text"])))
);


ALTER TABLE "public"."catalog_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "logo_url" "text",
    "address_zip" "text",
    "address_street" "text",
    "address_number" "text",
    "address_complement" "text",
    "address_neighborhood" "text",
    "address_city" "text",
    "address_state" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "industry" "text",
    "cnpj" "text",
    "whatsapp" "text",
    "email" "text",
    "show_quote_number" boolean DEFAULT true
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "document" "text",
    "email" "text",
    "phone" "text",
    "whatsapp" "text",
    "address_zip" "text",
    "address_street" "text",
    "address_number" "text",
    "address_complement" "text",
    "address_neighborhood" "text",
    "address_city" "text",
    "address_state" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "document_type" "text" DEFAULT 'cpf'::"text"
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."customers"."document_type" IS 'Tipo de documento: cpf, cnpj ou cnpj_alfanumerico';



CREATE TABLE IF NOT EXISTS "public"."notification_reads" (
    "notification_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "read_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notification_reads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'info'::"text"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "stripe_customer_id" "text",
    "subscription_status" "text" DEFAULT 'trialing'::"text",
    "trial_ends_at" timestamp with time zone,
    "subscription_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_admin" boolean DEFAULT false,
    "has_password" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "cancel_at_period_end" boolean DEFAULT false,
    "cancel_at" timestamp with time zone,
    CONSTRAINT "profiles_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['active'::"text", 'trialing'::"text", 'past_due'::"text", 'canceled'::"text", 'unpaid'::"text", 'incomplete'::"text", 'incomplete_expired'::"text", 'paused'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."subscription_status" IS 'Status da assinatura no Stripe. Valores permitidos: active, trialing, past_due, canceled, unpaid, incomplete, incomplete_expired, paused';



CREATE TABLE IF NOT EXISTS "public"."quote_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "quote_id" "uuid" NOT NULL,
    "catalog_item_id" "uuid",
    "item_name" "text" NOT NULL,
    "quantity" numeric(10,2) DEFAULT 1 NOT NULL,
    "unit_price" numeric(10,2) DEFAULT 0 NOT NULL,
    "subtotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "unit_measure" "text" DEFAULT 'un'::"text",
    "discount_type" "text" DEFAULT 'none'::"text",
    "discount_value" numeric DEFAULT 0
);


ALTER TABLE "public"."quote_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quote_receipts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "quote_id" "uuid",
    "receipt_number" "text" NOT NULL,
    "title" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "payment_method" "text",
    "services_description" "text",
    "issued_at" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "customer_id" "uuid"
);


ALTER TABLE "public"."quote_receipts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "customer_id" "uuid",
    "valid_until" "date",
    "subtotal" numeric(10,2) DEFAULT 0 NOT NULL,
    "discount_type" "text",
    "discount_value" numeric(10,2) DEFAULT 0,
    "total" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_method" "text"[],
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "title" "text",
    "cancellation_reason" "text",
    "quote_number" integer NOT NULL,
    "show_quote_number" boolean DEFAULT true,
    CONSTRAINT "quotes_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text", 'none'::"text"]))),
    CONSTRAINT "quotes_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'pending'::"text", 'approved'::"text", 'rejected'::"text", 'cancelled'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."receipt_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "receipt_id" "uuid" NOT NULL,
    "item_name" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "unit_price" numeric NOT NULL,
    "subtotal" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."receipt_items" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_quotes" WITH ("security_invoker"='true') AS
 SELECT "id",
    "user_id",
    "customer_id",
    "valid_until",
    "subtotal",
    "discount_type",
    "discount_value",
    "total",
    "payment_method",
    "notes",
    "created_at",
        CASE
            WHEN (("valid_until" < CURRENT_DATE) AND ("status" = 'pending'::"text")) THEN 'expired'::"text"
            ELSE "status"
        END AS "status",
    "status" AS "original_status",
    "title",
    "quote_number",
    "cancellation_reason",
    "show_quote_number"
   FROM "public"."quotes" "q";


ALTER VIEW "public"."vw_quotes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_receipts" WITH ("security_invoker"='true') AS
 SELECT "qr"."id",
    "qr"."user_id",
    "qr"."receipt_number",
    "qr"."title",
    "qr"."amount",
    "qr"."payment_method",
    "qr"."services_description",
    "qr"."issued_at",
    "qr"."quote_id",
    "q"."quote_number",
    "qr"."customer_id",
    COALESCE("c_direct"."name", "c_quote"."name") AS "customer_name",
        CASE
            WHEN ("qr"."quote_id" IS NULL) THEN 'standalone'::"text"
            ELSE 'quote'::"text"
        END AS "receipt_type",
    "qr"."created_at"
   FROM ((("public"."quote_receipts" "qr"
     LEFT JOIN "public"."quotes" "q" ON (("q"."id" = "qr"."quote_id")))
     LEFT JOIN "public"."customers" "c_direct" ON (("c_direct"."id" = "qr"."customer_id")))
     LEFT JOIN "public"."customers" "c_quote" ON (("c_quote"."id" = "q"."customer_id")));


ALTER VIEW "public"."vw_receipts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_reads"
    ADD CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("notification_id", "user_id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_receipts"
    ADD CONSTRAINT "quote_receipts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quote_receipts"
    ADD CONSTRAINT "quote_receipts_quote_id_key" UNIQUE ("quote_id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_user_id_quote_number_key" UNIQUE ("user_id", "quote_number");



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_notification_reads_user_id" ON "public"."notification_reads" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quote_receipts_quote_id" ON "public"."quote_receipts" USING "btree" ("quote_id");



CREATE INDEX "idx_quote_receipts_user_id" ON "public"."quote_receipts" USING "btree" ("user_id");



CREATE INDEX "idx_receipt_items_receipt_id" ON "public"."receipt_items" USING "btree" ("receipt_id");



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trg_prevent_quote_delete" BEFORE DELETE ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_quote_deletion"();



CREATE OR REPLACE TRIGGER "trg_prevent_quote_update" BEFORE UPDATE ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_quote_modification"();



CREATE OR REPLACE TRIGGER "trg_set_quote_number" BEFORE INSERT ON "public"."quotes" FOR EACH ROW EXECUTE FUNCTION "public"."set_next_quote_number"();



ALTER TABLE ONLY "public"."catalog_items"
    ADD CONSTRAINT "catalog_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_reads"
    ADD CONSTRAINT "notification_reads_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_reads"
    ADD CONSTRAINT "notification_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_catalog_item_id_fkey" FOREIGN KEY ("catalog_item_id") REFERENCES "public"."catalog_items"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quote_items"
    ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_receipts"
    ADD CONSTRAINT "quote_receipts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."quote_receipts"
    ADD CONSTRAINT "quote_receipts_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quote_receipts"
    ADD CONSTRAINT "quote_receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."receipt_items"
    ADD CONSTRAINT "receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "public"."quote_receipts"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage notifications" ON "public"."notifications" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Anyone can view notifications" ON "public"."notifications" FOR SELECT USING (true);



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage their own catalog items" ON "public"."catalog_items" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own company" ON "public"."companies" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own customers" ON "public"."customers" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own quote items" ON "public"."quote_items" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."quotes"
  WHERE (("quotes"."id" = "quote_items"."quote_id") AND ("quotes"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."quotes"
  WHERE (("quotes"."id" = "quote_items"."quote_id") AND ("quotes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own quotes" ON "public"."quotes" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own receipt items" ON "public"."receipt_items" USING ((EXISTS ( SELECT 1
   FROM "public"."quote_receipts" "qr"
  WHERE (("qr"."id" = "receipt_items"."receipt_id") AND ("qr"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."quote_receipts" "qr"
  WHERE (("qr"."id" = "receipt_items"."receipt_id") AND ("qr"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own receipts" ON "public"."quote_receipts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark notifications as read" ON "public"."notification_reads" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own reads" ON "public"."notification_reads" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."catalog_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_reads" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quote_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quote_receipts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."receipt_items" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."close_account"() TO "anon";
GRANT ALL ON FUNCTION "public"."close_account"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_account"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_quote_details"("p_quote_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_quote_details"("p_quote_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_quote_details"("p_quote_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_quote_deletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_quote_deletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_quote_deletion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_quote_modification"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_quote_modification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_quote_modification"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_next_quote_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_next_quote_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_next_quote_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."simple_hashid"("val" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."simple_hashid"("val" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."simple_hashid"("val" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean, "p_cancel_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean, "p_cancel_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_subscription"("p_stripe_customer_id" "text", "p_subscription_status" "text", "p_subscription_id" "text", "p_cancel_at_period_end" boolean, "p_cancel_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_quote_with_items"("p_quote_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_status" "text", "p_subtotal" numeric, "p_total" numeric, "p_valid_until" "date", "p_discount_type" "text", "p_discount_value" numeric, "p_notes" "text", "p_items" "jsonb", "p_user_id" "uuid", "p_payment_method" "text"[], "p_show_quote_number" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_quote_with_items"("p_quote_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_status" "text", "p_subtotal" numeric, "p_total" numeric, "p_valid_until" "date", "p_discount_type" "text", "p_discount_value" numeric, "p_notes" "text", "p_items" "jsonb", "p_user_id" "uuid", "p_payment_method" "text"[], "p_show_quote_number" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_quote_with_items"("p_quote_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_status" "text", "p_subtotal" numeric, "p_total" numeric, "p_valid_until" "date", "p_discount_type" "text", "p_discount_value" numeric, "p_notes" "text", "p_items" "jsonb", "p_user_id" "uuid", "p_payment_method" "text"[], "p_show_quote_number" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_receipt_with_items"("p_receipt_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_amount" numeric, "p_payment_method" "text", "p_services_description" "text", "p_issued_at" "date", "p_items" "jsonb", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_receipt_with_items"("p_receipt_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_amount" numeric, "p_payment_method" "text", "p_services_description" "text", "p_issued_at" "date", "p_items" "jsonb", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_receipt_with_items"("p_receipt_id" "uuid", "p_customer_id" "uuid", "p_title" "text", "p_amount" numeric, "p_payment_method" "text", "p_services_description" "text", "p_issued_at" "date", "p_items" "jsonb", "p_user_id" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."catalog_items" TO "anon";
GRANT ALL ON TABLE "public"."catalog_items" TO "authenticated";
GRANT ALL ON TABLE "public"."catalog_items" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."notification_reads" TO "anon";
GRANT ALL ON TABLE "public"."notification_reads" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_reads" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quote_items" TO "anon";
GRANT ALL ON TABLE "public"."quote_items" TO "authenticated";
GRANT ALL ON TABLE "public"."quote_items" TO "service_role";



GRANT ALL ON TABLE "public"."quote_receipts" TO "anon";
GRANT ALL ON TABLE "public"."quote_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."quote_receipts" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."receipt_items" TO "anon";
GRANT ALL ON TABLE "public"."receipt_items" TO "authenticated";
GRANT ALL ON TABLE "public"."receipt_items" TO "service_role";



GRANT ALL ON TABLE "public"."vw_quotes" TO "anon";
GRANT ALL ON TABLE "public"."vw_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_quotes" TO "service_role";



GRANT ALL ON TABLE "public"."vw_receipts" TO "anon";
GRANT ALL ON TABLE "public"."vw_receipts" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_receipts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Auth Users Delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'company-logos'::text) AND (auth.uid() = owner)));



  create policy "Auth Users Update"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'company-logos'::text) AND (auth.uid() = owner)));



  create policy "Auth Users Upload"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'company-logos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Public Access"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'company-logos'::text));



