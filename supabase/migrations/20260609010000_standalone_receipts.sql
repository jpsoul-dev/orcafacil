-- Migration: Suporte a Recibos Avulsos (Standalone Receipts)
-- Created: 2026-06-09
-- Path: supabase/migrations/20260609010000_standalone_receipts.sql

-- 1. Alterar a coluna quote_id na tabela quote_receipts para aceitar NULL
ALTER TABLE public.quote_receipts ALTER COLUMN quote_id DROP NOT NULL;

-- 2. Adicionar a coluna customer_id na tabela quote_receipts referenciando customers
-- ON DELETE RESTRICT garante que o cliente não possa ser deletado se houver recibos associados
ALTER TABLE public.quote_receipts ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE RESTRICT;

-- 3. Criar a tabela receipt_items para armazenar os itens dos recibos avulsos
CREATE TABLE IF NOT EXISTS public.receipt_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id uuid NOT NULL REFERENCES public.quote_receipts(id) ON DELETE CASCADE,
    item_name text NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    subtotal numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Ativa o Row Level Security (RLS) na nova tabela
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- 4. Criar política RLS para receipt_items
-- Permite todas as operações se o usuário for o dono do recibo associado
CREATE POLICY "Users can manage their own receipt items" ON public.receipt_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.quote_receipts qr
            WHERE qr.id = receipt_id AND qr.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quote_receipts qr
            WHERE qr.id = receipt_id AND qr.user_id = auth.uid()
        )
    );

-- Cria índice para otimização de joins na nova tabela
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON public.receipt_items(receipt_id);

-- 5. Criar a View vw_receipts com Security Invoker ativo para segurança RLS
-- Unifica recibos avulsos e recibos vinculados a orçamentos
CREATE OR REPLACE VIEW public.vw_receipts WITH (security_invoker = true) AS
SELECT 
  qr.id,
  qr.user_id,
  qr.receipt_number,
  qr.title,
  qr.amount,
  qr.payment_method,
  qr.services_description,
  qr.issued_at,
  qr.quote_id,
  q.quote_number,
  qr.customer_id,
  COALESCE(c_direct.name, c_quote.name) as customer_name,
  CASE 
    WHEN qr.quote_id IS NULL THEN 'standalone'
    ELSE 'quote'
  END as receipt_type,
  qr.created_at
FROM public.quote_receipts qr
LEFT JOIN public.quotes q ON q.id = qr.quote_id
LEFT JOIN public.customers c_direct ON c_direct.id = qr.customer_id
LEFT JOIN public.customers c_quote ON c_quote.id = q.customer_id;

-- 6. Criar a RPC upsert_receipt_with_items para manipulação transacional e atômica
CREATE OR REPLACE FUNCTION public.upsert_receipt_with_items(
  p_receipt_id uuid,
  p_customer_id uuid,
  p_title text,
  p_amount numeric,
  p_payment_method text,
  p_services_description text,
  p_issued_at date,
  p_items jsonb,
  p_user_id uuid
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;
