-- Migration: Melhorias no Ciclo de Vida de Orçamentos, Dashboard Administrativo e Recibos
-- Created: 2026-06-03
-- Path: supabase/migrations/20260603000000_budget_lifecycle_improvements.sql

-- Adiciona a coluna cancellation_reason
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- 1. Desabilita temporariamente os triggers de segurança para permitir o update e alteração de schema
ALTER TABLE public.quotes DISABLE TRIGGER trg_prevent_quote_update;
ALTER TABLE public.quotes DISABLE TRIGGER trg_prevent_quote_delete;
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_status_check;

-- 2. Migra e normaliza os dados legados de status definitivamente
UPDATE public.quotes SET status = 'pending' WHERE status = 'open';
UPDATE public.quotes SET status = 'approved' WHERE status = 'accepted';

-- 3. Aplica a nova check constraint rígida de status na tabela quotes
ALTER TABLE public.quotes ADD CONSTRAINT quotes_status_check 
    CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'completed'::text]));

-- 4. Atualiza as funções dos triggers de segurança com as novas regras de ciclo de vida
CREATE OR REPLACE FUNCTION public.prevent_quote_modification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.prevent_quote_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Permite a exclusão física unicamente para orçamentos na situação 'draft'
  IF OLD.status IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'Apenas orçamentos na situação "Rascunho" (draft) podem ser excluídos fisicamente.';
  END IF;
  RETURN OLD;
END;
$function$;

-- 5. Reabilita os triggers com as novas regras em vigor
ALTER TABLE public.quotes ENABLE TRIGGER trg_prevent_quote_update;
ALTER TABLE public.quotes ENABLE TRIGGER trg_prevent_quote_delete;

-- 6. Recria a view vw_quotes adaptando para verificar 'pending' na expiração
CREATE OR REPLACE VIEW public.vw_quotes AS
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
    q.hash_id
   FROM quotes q;

-- 7. Cria a tabela de recibos
CREATE TABLE IF NOT EXISTS public.quote_receipts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE UNIQUE,
    receipt_number text NOT NULL,
    title text NOT NULL,
    amount numeric NOT NULL,
    payment_method text,
    services_description text,
    issued_at date NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Ativa o RLS em quote_receipts
ALTER TABLE public.quote_receipts ENABLE ROW LEVEL SECURITY;

-- Cria políticas RLS
DROP POLICY IF EXISTS "Users can manage their own receipts" ON public.quote_receipts;
CREATE POLICY "Users can manage their own receipts" ON public.quote_receipts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Cria índices para otimização de buscas e joins
CREATE INDEX IF NOT EXISTS idx_quote_receipts_quote_id ON public.quote_receipts(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_receipts_user_id ON public.quote_receipts(user_id);

-- 8. Alteração de Schema da tabela companies para Onboarding
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.companies ALTER COLUMN phone DROP NOT NULL;

-- 9. Função Postgres para Encerramento Seguro de Conta (Multi-Tenant)
CREATE OR REPLACE FUNCTION public.close_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Obtém o ID do usuário autenticado solicitante
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    -- Deleta a empresa vinculada ao usuário solicitante (modelo 1:1)
    -- A exclusão em cascata (ON DELETE CASCADE) de companies limpará quotes, customers, etc.
    DELETE FROM public.companies WHERE user_id = v_user_id;

    -- Deleta o perfil do usuário
    DELETE FROM public.profiles WHERE id = v_user_id;

    -- Deleta o usuário da tabela de autenticação auth.users
    DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

