# Interface Contracts: Recibos e Transições

Este documento estabelece as assinaturas das Server Actions e esquemas de validação do Zod para garantir a integridade no fluxo de dados dos Recibos e Orçamentos.

---

## 1. Esquemas de Validação (Zod Schemas)

Os esquemas abaixo serão declarados em `app/app/quotes/schemas.ts`:

### Novo Schema de Situação (`statusSchema`)
```typescript
export const statusSchema = z.enum([
  'draft',      // Rascunho
  'pending',    // Pendente (antigo open)
  'approved',   // Aprovado (antigo accepted)
  'rejected',   // Rejeitado
  'cancelled',  // Cancelado
  'completed'   // Finalizado
])
```

### Schema de Validação de Motivo de Cancelamento
```typescript
export const cancelQuoteSchema = z.object({
  quoteId: z.string().uuid('ID do orçamento inválido'),
  cancellationReason: z.string().min(5, 'O motivo do cancelamento deve possuir no mínimo 5 caracteres')
})
```

### Schema de Validação de Recibo (`receiptSchema`)
```typescript
export const receiptSchema = z.object({
  id: z.string().uuid().optional(),
  quoteId: z.string().uuid('ID do orçamento inválido'),
  title: z.string().min(1, 'O título do recibo é obrigatório'),
  amount: z.coerce.number().min(0.01, 'O valor do recibo deve ser maior que zero'),
  paymentMethod: z.string().min(1, 'A forma de pagamento é obrigatória'),
  servicesDescription: z.string().min(1, 'A descrição dos serviços é obrigatória'),
  issuedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de emissão inválida (formato AAAA-MM-DD)')
})

export type ReceiptInput = z.infer<typeof receiptSchema>
```

---

## 2. Server Actions (Contratos do Servidor)

As seguintes funções serão expostas como ações seguras do servidor:

### Alteração do Status com Motivo (`updateQuoteStatus`)
Atualizar a ação existente em `app/app/quotes/actions.ts` para validar o motivo ao transicionar para `cancelled`:
```typescript
export async function updateQuoteStatus(
  id: string, 
  status: string, 
  cancellationReason?: string
): Promise<{ success: boolean; error?: string }>
```
*   **Comportamento**:
    1.  Verificar autenticação do usuário.
    2.  Validar o `status` contra o `statusSchema`.
    3.  Se `status === 'cancelled'`, exigir que o `cancellationReason` seja fornecido e validá-lo contra o `cancelQuoteSchema`.
    4.  Atualizar a tabela `quotes` no Supabase filtrando por `id` e `user_id` (para conformidade multi-tenant).
    5.  Revalidar os caminhos `/app/quotes` e `/app/quotes/[id]`.

### Criação e Edição de Recibo (`saveReceipt`)
Declarada em `app/app/quotes/receipt-actions.ts`:
```typescript
export async function saveReceipt(
  data: ReceiptInput
): Promise<{ success: boolean; id?: string; error?: string }>
```
*   **Comportamento**:
    1.  Verificar autenticação do usuário.
    2.  Validar os dados de entrada usando o `receiptSchema`.
    3.  Garantir a propriedade multi-tenant: buscar o orçamento associado (`quote_id`) e verificar se o `user_id` é correspondente ao usuário logado.
    4.  Se for um recibo novo, contar a quantidade de recibos existentes do usuário e formatar o `receipt_number` (ex: `REC-005`).
    5.  Inserir ou atualizar a tabela `quote_receipts` no Supabase.
    6.  Revalidar os caminhos correspondentes do orçamento e recibo.
    7.  Retornar sucesso e o ID do recibo criado/salvo.

### Exclusão de Recibo (`deleteReceipt`)
Declarada em `app/app/quotes/receipt-actions.ts`:
```typescript
export async function deleteReceipt(
  receiptId: string
): Promise<{ success: boolean; error?: string }>
```
*   **Comportamento**:
    1.  Verificar autenticação do usuário.
    2.  Remover o registro de `quote_receipts` correspondente ao ID, verificando propriedade (`user_id = user.id`).
    3.  Revalidar as páginas do orçamento correspondente.
