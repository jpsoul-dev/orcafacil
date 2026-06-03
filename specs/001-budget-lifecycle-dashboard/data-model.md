# Data Model: Orçamentos e Recibos

Este documento detalha o modelo físico e lógico de dados no banco de dados Supabase (PostgreSQL) para suportar as melhorias no ciclo de vida de orçamentos e a geração de recibos.

---

## 1. Entidade: `public.quotes` (Orçamentos)

Tabela física existente modificada para comportar a extensão do ciclo de vida e a justificativa de desistências.

### Colunas e Atributos

| Coluna | Tipo | Restrições | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **id** | `uuid` | PRIMARY KEY | `uuid_generate_v4()` | Identificador único interno. |
| **user_id** | `uuid` | FOREIGN KEY | `auth.users(id)` | Dono do orçamento (tenant). |
| **customer_id**| `uuid` | FOREIGN KEY | `public.customers(id)` | Cliente do orçamento. |
| **valid_until**| `date` | Nullable | - | Data de validade da proposta. |
| **subtotal** | `numeric` | NOT NULL | `0` | Subtotal acumulado sem descontos. |
| **discount_type** | `text` | Check constraint | `'none'` | Tipo de desconto (`none`, `percentage`, `fixed`). |
| **discount_value**| `numeric` | Nullable | `0` | Valor do desconto aplicado. |
| **total** | `numeric` | NOT NULL | `0` | Valor total com desconto aplicado. |
| **payment_method**| `text` | Nullable | - | Forma de pagamento (ex: 'pix', 'boleto'). |
| **notes** | `text` | Nullable | - | Observações ou anotações internas. |
| **created_at** | `timestamptz` | Nullable | `now()` | Data de criação do orçamento. |
| **status** | `text` | Check constraint | `'draft'` | Situação do orçamento (ver abaixo). |
| **title** | `text` | Nullable | - | Título curto do orçamento. |
| **hash_id** | `text` | UNIQUE, Nullable | - | Hash curto gerado para link de identificação. |
| **cancellation_reason** | `text` | Nullable | - | **[NOVO]** Motivo para cancelamento após aprovação. |

### Domínio de Status (Check Constraint)
A restrição de validação da coluna `status` (`quotes_status_check`) será recriada no banco para permitir os seguintes valores:
*   `draft`: Rascunho de orçamento em elaboração.
*   `pending`: Orçamento ativado pronto para envio/impressão (antigo `open`).
*   `approved`: Orçamento aprovado pelo cliente (antigo `accepted`).
*   `rejected`: Orçamento rejeitado pelo cliente.
*   `cancelled`: Orçamento cancelado pelo prestador (exige motivo).
*   `completed`: Orçamento finalizado com sucesso (serviço prestado/pago).

---

## 2. Entidade: `public.quote_receipts` (Recibos de Quitação)

**[NOVA TABELA]** Armazena a declaração de quitação e o comprovante de pagamento emitido para orçamentos concluídos.

### Colunas e Atributos

| Coluna | Tipo | Restrições | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **id** | `uuid` | PRIMARY KEY | `gen_random_uuid()` | Identificador único do recibo. |
| **user_id** | `uuid` | NOT NULL, FOREIGN KEY | `auth.users(id) ON DELETE CASCADE` | Dono do recibo (isolamento tenant). |
| **quote_id** | `uuid` | NOT NULL, FOREIGN KEY, UNIQUE | `public.quotes(id) ON DELETE CASCADE` | Orçamento original de origem (relação 1:1). |
| **receipt_number**| `text` | NOT NULL | - | Número do recibo formatado (ex: `REC-001`). |
| **title** | `text` | NOT NULL | - | Título descritivo editável do recibo. |
| **amount** | `numeric` | NOT NULL | - | Valor recebido e quitado (inicializado do orçamento). |
| **payment_method**| `text` | Nullable | - | Forma de pagamento utilizada na quitação. |
| **services_description**| `text` | Nullable | - | Descrição detalhada livre do serviço prestado. |
| **issued_at** | `date` | NOT NULL | - | Data de emissão/recebimento do recibo. |
| **created_at** | `timestamptz` | Nullable | `now()` | Timestamp de persistência no sistema. |

### Relacionamentos
*   `quotes` (1) ── (0..1) `quote_receipts`: Um orçamento na situação `completed` pode possuir no máximo um único recibo associado.

### Segurança Row Level Security (RLS)
*   **Políticas**:
    *   `SELECT`: Permitido apenas se `auth.uid() = user_id`.
    *   `INSERT`: Permitido apenas se `auth.uid() = user_id`.
    *   `UPDATE`: Permitido apenas se `auth.uid() = user_id`.
    *   `DELETE`: Permitido apenas se `auth.uid() = user_id`.

---

## 3. Scripts de Atualização de Banco (DDL/DML)

Os seguintes comandos SQL de migração estrutural serão incluídos no script da migration:

```sql
-- Adiciona a coluna cancellation_reason
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- 1. Remove a constraint de status antiga para permitir a migração dos dados
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_status_check;

-- 2. Migra e normaliza os dados legados definitivamente
UPDATE public.quotes SET status = 'pending' WHERE status = 'open';
UPDATE public.quotes SET status = 'approved' WHERE status = 'accepted';

-- 3. Aplica a nova check constraint rígida sem os status depreciados
ALTER TABLE public.quotes ADD CONSTRAINT quotes_status_check 
    CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'completed'::text]));

-- 4. Recria a view vw_quotes adaptando para verificar 'pending' na expiração
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

-- 5. Cria a tabela de recibos
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
CREATE POLICY "Users can manage their own receipts" ON public.quote_receipts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Cria índices para otimização de buscas e joins
CREATE INDEX IF NOT EXISTS idx_quote_receipts_quote_id ON public.quote_receipts(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_receipts_user_id ON public.quote_receipts(user_id);
```
