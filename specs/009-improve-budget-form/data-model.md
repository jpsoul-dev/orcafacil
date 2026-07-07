# Data Model: Reorganização do Formulário de Novo Orçamento

Este documento detalha o modelo de dados, schemas de validação e modificações de tipos necessárias para a reorganização do formulário.

## 1. Modificações de Schemas (Zod)

### Localização: `app/app/quotes/schemas.ts` e inline em `quote-form.tsx`

O schema dos itens de orçamento (`quoteItemSchema`) e o do orçamento (`quoteSchema`) serão atualizados para remover as propriedades de desconto individual por item.

```typescript
// ANTES (No schemas.ts)
export const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.coerce.number(),
  unit_measure: z.string().optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed', 'none']).optional().nullable().default('none'),
  discount_value: z.coerce.number().optional().nullable().default(0),
})

// DEPOIS (Sem propriedades de desconto individual)
export const quoteItemSchema = z.object({
  catalog_item_id: z.string().optional().nullable(),
  item_name: z.string().min(1, 'Nome do item obrigatório'),
  quantity: z.coerce.number().min(0.01),
  unit_price: z.coerce.number().min(0),
  subtotal: z.coerce.number(),
  unit_measure: z.string().optional().nullable(),
})
```

---

## 2. Ajustes nas Interfaces do TypeScript

### Localização: `types/quote.ts` e `app/app/quotes/components/quote-form.tsx`

As interfaces TypeScript que representam o item do orçamento serão atualizadas.

```typescript
// Modificação em types/quote.ts -> QuoteItem
export interface QuoteItem {
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  unit_measure?: string
  // discount_type e discount_value são removidos ou deixados como opcionais legados 
  // para visualização de dados históricos. No fluxo de criação, não serão gerados.
  discount_type?: 'none' | 'percentage' | 'fixed' | null
  discount_value?: number | null
}
```

---

## 3. Estado Local do Formulário (React Hook Form)

O formulário gerenciará o estado local do orçamento com as seguintes propriedades principais:

- `title`: String (opcional) - Título do orçamento
- `customer_id`: UUID - ID do cliente selecionado
- `valid_until`: Date String (AAAA-MM-DD) - Data de validade
- `items`: Array de `QuoteItem` - Itens do orçamento (sem descontos individuais)
- `discount_type`: `'none' | '%' | 'R$'` - Tipo de desconto geral do orçamento
- `discount_value`: Number - Valor do desconto geral
- `payment_method`: Array de Strings - Formas de pagamento selecionadas (salvas após confirmação no painel lateral)
- `notes`: Rich Text String - Termos e condições do orçamento (salvos após confirmação no painel lateral)
- `show_quote_number`: Boolean - Exibir número do orçamento
